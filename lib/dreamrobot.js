'use strict';

// const path = require('path');
const request = require('request');
const https = require('https');
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

	function fetchAndSaveToken(authParameters) {
		return new Promise((resolve, reject) => {
			console.log("fetchAndSaveToken");
			const now = new Date();
			let authTokenResponse;

			try {
				const options = {
					// followAllRedirects: true,
					url: buildUrl('token.php'),
					method: 'POST',
					// json: true,
					// body: authParameters,
					headers: {					//Buffer.from(str, 'base64').toString('binary')
						'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password, 'binary').toString('base64')
					}
				};

				console.log("BEFORE fetchAndSaveToken https.request cb!");
				const con = https.request(options, (resp) => {
					console.log("fetchAndSaveToken https.request cb!");
					let data = '';

					// A chunk of data has been recieved.
					resp.on('data', (chunk) => {
						data += chunk;
					});

					// The whole response has been received. Print out the result.
					resp.on('end', () => {
						console.log(JSON.parse(data).explanation);


						if (!authTokenResponse.body || !authTokenResponse.body.access_token) {
							throw new Error(`Failed to obtain new tokens: ${JSON.stringify(authTokenResponse)}`);
						}

						// noinspection JSUnresolvedVariable
						config.oauth = authTokenResponse.body;
						config.oauth.access_token_expiry = new Date(now.getTime() + 3600000).toISOString();
						config.oauth.refresh_token_expiry = new Date(now.getTime() + 30*24*3600 * 1000).toISOString();

						// Workaround for https://github.com/elasticio/sailor-nodejs/issues/57
						if (emitter && emitter.emit) {
							emitter.emit('updateKeys', config);
						}

						console.log(`Successfully retrieved updated tokens.  Access token expires at ${config.oauth.access_token_expiry}.  
				Refresh token expires at ${config.oauth.refresh_token_expiry}`);

						return resolve(config.oauth.access_token);
					});

				}).on("error", (err) => {

					console.log("HTTPS CB Error: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
					reject(err.message);
				}).on("abort", (err) => {

					console.log("HTTPS CB abort: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
					reject(err.message);
				}).on("connect", (err) => {

				//	reject(err.message);
					console.log("HTTPS CB connect: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
				}).on("continue", (err) => {

				//	reject(err.message);
					console.log("HTTPS CB continue: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
				}).on("information", (err) => {

				//	reject(err.message);
					console.log("HTTPS CB information: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
				}).on("response", (err) => {

				//	reject(err.message);
					console.log("HTTPS CB response: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
				}).on("timeout", (err) => {

				//	reject(err.message);
					console.log("HTTPS CB timeout: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
				});

				con.write(JSON.stringify(authParameters));
				con.end();
			}
			catch (e)
			{
				// console.log("error on Token Request!" + JSON.stringify(e, Object.getOwnPropertyNames(e)));
				reject("error on Token Request!" + JSON.stringify(e, Object.getOwnPropertyNames(e)));
			}

			// console.log(JSON.stringify(authTokenResponse));
		});
	}

	async function getTokenUsingUserCredentials() {
		const createParameters = {
			grant_type: 'client_credentials'
		};

		return await fetchAndSaveToken(createParameters);
	}

	/**
	 * @returns {string} A valid access token
	 */
	async function auth() {
		if(!config.oauth)
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
		console.log('makeRequest - access: ' + accessToken);
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

		const response = request(parameters);

		if (response.statusCode >= 300) {
			console.log("Anfrage fehlgeschlagen");
			throw new Error(`Request-Error: ${response.body.error}: ${response.body.error_message}`);
		}
		return response.body;
	};

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