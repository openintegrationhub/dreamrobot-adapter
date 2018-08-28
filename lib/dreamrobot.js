'use strict';

// const path = require('path');
const request = require('request-promise');
// const _ = require('underscore');
// const urlParser = require('url');

const API_URI = 'https://api.dreamrobot.de/rest/v1.1/';

/**
 * Return configured API caller instance.  This caller instance handles authentication
 * @constructor
 * @param {Object} config
 * @param {string} config.username - User's login info
 * @param {string} config.password - User's login info
 * @param {Object} emitter
 * @param {function} emitter.emit
 * @returns {{makeRequest: Function, getListOfModules: Function}}
 * @constructor
 */
module.exports = function Service(config, emitter) {
	console.log('Start construct Dreamrobot');

	if (!config || !config.username || !config.password) {
		throw new Error('DreamRobot Configuration is missing');
	}

	function buildUrl(url_path) {
		return API_URI + url_path;
	}

	/**
	 * Check the response from DreamRobot.  Returns true for 200s responses authenticated.
	 * Returns false if there is a problem with authentication.
	 * Throws an exception for all other response codes.
	 * @returns {boolean}
	 */
	function wasAuthenticationSuccessful(dreamrobot_response) {
		if (dreamrobot_response.statusCode >= 200 && dreamrobot_response.statusCode < 300) {
			return true;
		}

		if (dreamrobot_response.statusCode === 401 && dreamrobot_response.body
			&& dreamrobot_response.body.error === 'invalid_grant') {
			return false;
		}

		throw new Error(`Unexpected response from provider.  Status code: ${dreamrobot_response.statusCode} Body: 
            ${JSON.stringify(dreamrobot_response.body)}`);
	}

	async function fetchAndSaveToken(authParameters) {
		const now = new Date();

		const authTokenResponse = await request({
			followAllRedirects: true,
			url: buildUrl('token.php'),
			method: 'POST',
			json: true,
			body: authParameters,
			headers: {					//Buffer.from(str, 'base64').toString('binary')
				'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password, 'binary').toString('base64')
			}
		});

		console.log("Answer: ");
		console.log(authTokenResponse);

		if (!wasAuthenticationSuccessful(authTokenResponse)) {
			throw new Error(`Failed to obtain new tokens: ${JSON.stringify(authTokenResponse)}`);
		}

		// noinspection JSUnresolvedVariable
		config.oauth = authTokenResponse.body;
		config.oauth.access_token_expiry = new Date(now.getTime() + 3600000).toISOString();
		config.oauth.refresh_token_expiry = new Date(now.getTime() + 30*24*3600 * 1000).toISOString();

		// Workaround for https://github.com/elasticio/sailor-nodejs/issues/57
		if (emitter && emitter.emit) {
			emitter.emit('updateKeys', {
				oauth: config.oauth
			});
		}

		console.log(`Successfully retrieved updated tokens.  Access token expires at ${config.oauth.access_token_expiry}.  
            Refresh token expires at ${config.oauth.refresh_token_expiry}`);

		return config.oauth.access_token;
	}

	async function getTokenUsingUserCredentials() {
		const createParameters = {
			grant_type: 'client_credentials'
		};

		return await fetchAndSaveToken(createParameters);
	}

	// async function getAccessTokenUsingRefreshToken() {
	// 	const refreshParameters = {
	// 		grant_type: 'refresh_token',
	// 	};
	//
	// 	return await fetchAndSaveToken(refreshParameters);
	// }

	/**
	 * @returns {string} A valid access token
	 */
	async function auth() {
		//TODO: Zeile rausschmeißen...
		config.oauth = {};

		const now = new Date();

		// If no access token, fetch access token using user credentials
		if (!config.oauth.access_token) {
			console.log('No access token found.  Fetching access token with user credentials...');
			return await getTokenUsingUserCredentials();
		}

		// Do nothing if access token should already be valid
		if (now < new Date(config.oauth.access_token_expiry)) {
			console.log('Current access token should be valid.  Will attempt access with this token...');
			return config.oauth.access_token;
		}

		// Use refresh_token to fetch new access token.
		// If that fails, try password auth.
		console.log(`The current access token has expired at ${config.oauth.access_token_expiry}`);

		//Refresh nicht unterstützen.
		// if (now < new Date(config.oauth.refresh_token_expiry)) {
		// 	console.log('The refresh token appears to be valid.  Attempting to fetch new token using refresh token...');
		// 	return await getAccessTokenUsingRefreshToken();
		// }

		// console.log(`The current refresh token has also expired at ${config.oauth.refresh_token_expiry}.
        //    Attempting to fetch tokens with password.`);
		return await getTokenUsingUserCredentials();
	}

	/**
	 * Base caller function
	 * @param {string} rest_path
	 * @param {string} method (GET || POST || PUT)
	 * @param {Object} body for POST/PUT requests
	 * @returns {Object} response body
	 */
	this.makeRequest = async function makeRequest(rest_path, method, body) {
		console.log('makeRequest');
		const accessToken = await auth();
		const parameters = {
			followAllRedirects: true,
			url: buildUrl(rest_path),
			method: method,
			json: true,
			body: body,
			headers: {
				Authorization: "Bearer " + accessToken
			}
		};

		console.log(`About to make request.  Url: ${buildUrl(rest_path)}, Method: ${method}`);

		const response = await request(parameters);

		if (!wasAuthenticationSuccessful(response)) {
			throw new Error(`Authentication error: ${response.body.error}: ${response.body.error_message}`);
		}
		return response.body;
	};

	console.log('construct Dreamrobot after makeRequest');

	/**
	 *
	 * @return {[string]} - Alphabetic list of modules
	 */
	// this.getModules = function getModules(includeReadonlyModules) {
	// 	const moduleData = this.makeRequest('metadata?type_filter=full_module_list,modules', 'GET');
	// 	const moduleList = moduleData.full_module_list;
	// 	return Object.keys(moduleList).reduce((result, key) => {
	// 		if (key === '_hash') {
	// 			return result;
	// 		}
	// 		const fields = moduleData.modules[key].fields;
	// 		if (Object.keys(fields).length === 1) {
	// 			return result;
	// 		}
	//
	// 		const hasWritableFields = Object.keys(fields)
	// 		.some(fieldKey =>
	// 			!fields[fieldKey].readonly && fields[fieldKey].source !== 'non-db' && fieldKey !== '_hash');
	//
	// 		if (includeReadonlyModules || hasWritableFields) {
	// 			result[key] = moduleList[key];
	// 		}
	// 		return result;
	// 	}, {});
	// };
	//
	// this.buildInSchemaForModule = function buildInSchemaForModule(module) {
	// 	const moduleDetails
	// 		= this.makeRequest(`metadata?type_filter=modules&module_filter=${encodeURIComponent(module)}`, 'GET');
	// 	const moduleFields = moduleDetails.modules[module].fields;
	//
	// 	const schema = {
	// 		type: 'object',
	// 		properties: {}
	// 	};
	// 	const writableKeys = Object.keys(moduleFields)
	// 	.filter((key) => key !== '_hash'               // Ignore hash of schema
	// 		&& !moduleFields[key].readonly             // Ignore readonly properties
	// 		&& moduleFields[key].source !== 'non-db'   // Ignore computed properties
	// 	);
	//
	// 	// Get enum values
	// 	const enumKeys = writableKeys.filter(key => moduleFields[key].type === 'enum');
	// 	const enumPromises = enumKeys.map(key => this.makeRequest(`${module}/enum/${key}`, 'GET'));
	// 	const enumResults = Promise.all(Object.values(enumPromises));
	// 	const enumDictionary = enumKeys.reduce((dictionarySoFar, key, index) => {
	// 		dictionarySoFar[key] = enumResults[index];
	// 		return dictionarySoFar;
	// 	}, {});
	//
	// 	writableKeys.forEach((key) => {
	// 		const field = moduleFields[key];
	// 		const subSchema = {
	// 			required: field.required,
	// 			title: field.name,
	// 			default: field.default,
	// 			maxLength: field.len,
	// 			description: field.comments
	// 		};
	//
	// 		switch (field.type) {
	// 			case 'id':
	// 				// IDs are UUIDs
	// 				subSchema.type = 'string';
	// 				subSchema.pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';
	// 				break;
	// 			case 'date':
	// 				subSchema.type = 'string';
	// 				subSchema.format = 'date-time';
	// 				break;
	// 			case 'url':
	// 				subSchema.type = 'string';
	// 				subSchema.format = 'uri';
	// 				break;
	// 			case 'bool':
	// 				subSchema.type = 'boolean';
	// 				break;
	// 			case 'enum':
	// 				subSchema.type = 'string';
	// 				subSchema.enum = Object.values(enumDictionary[key]);
	// 				break;
	// 			case 'int':
	// 				subSchema.type = 'integer';
	// 				break;
	// 			case 'text':
	// 			case 'varchar':
	// 			case 'phone':
	// 			case 'image':
	// 			case 'username':
	// 			case 'password':
	// 			case 'team_list':
	// 			default:
	// 				subSchema.type = 'string';
	// 				break;
	// 		}
	//
	// 		schema.properties[key] = subSchema;
	// 	});
	//
	// 	return {
	// 		in: schema
	// 	};
	// };
	//
	// this.buildOutSchemaForModule = function buildOutSchemaForModule(module) {
	// 	const moduleDetails = this.makeRequest(`metadata?module_filter=${encodeURIComponent(module)}`, 'GET');
	// 	const moduleFields = moduleDetails.modules[module].fields;
	//
	// 	const schema = {
	// 		type: 'object',
	// 		properties: {}
	// 	};
	// 	Object.keys(moduleFields).forEach((key) => {
	// 		schema.properties[key] = {
	// 			required: moduleFields[key].required,
	// 			title: moduleFields[key].name,
	// 			type: 'string'
	// 		};
	// 	});
	//
	// 	return {
	// 		out: schema
	// 	};
	// };
	//
	// this.webhookStartup = function webhookStartup(config, eventToListenTo) {
	// 	const response = this.makeRequest('WebLogicHooks', 'POST', {
	// 		trigger_event: eventToListenTo,
	// 		url: process.env.ELASTICIO_FLOW_WEBHOOK_URI,
	// 		request_method: 'POST',
	// 		webhook_target_module: config.module,
	// 		description: 'Created by the elastic.io platform',
	// 		name: `Elastic.io Get new and updated ${config.module} webhook`
	// 	});
	//
	// 	return {
	// 		name: response.name,
	// 		id: response.id
	// 	};
	// };


	console.log('End construct Dreamrobot');

	return this;
};