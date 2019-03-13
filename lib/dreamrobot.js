'use strict';

// const path = require('path');
// const request = require('request');

// const request = require('request-promise');

const { promisify } = require('util');
const request = promisify(require('request'));

// const https = require('https');
// const _ = require('underscore');
// const urlParser = require('url');

const API_URI = 'https://api.dreamrobot.de/rest/v1.1/';
// const API_URI = 'https://test-php7.dreamrobot.de/rest/v1.1/';
const API_PROTOCOL = 'https:';
const API_HOST = 'api.dreamrobot.de';
// const API_HOST = 'test-php7.dreamrobot.de';
const API_PATH = '/rest/v1.1/';

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
	// console.log('Start construct Dreamrobot');

	if (!config || !config.username || !config.password) {
		throw new Error('DreamRobot Configuration is missing');
	}

	function buildUrl(url_path) {
		return API_URI + url_path;
	}

	function buildPath(url_path) {
		return API_PATH + url_path;
	}

	function fetchAndSaveToken(authParameters) {
		return new Promise((resolve, reject) => {
			// console.log("fetchAndSaveToken");
			const now = new Date();
			let authTokenResponse;

			const options = {
				followAllRedirects: true,
				url: buildUrl('token.php'),
				// protocol: API_PROTOCOL,
				// port: 443,
				// hostname: API_HOST,
				// path: buildPath('token.php'),
				method: 'POST',
				json: true,
				body: authParameters,
				headers: {					//Buffer.from(str, 'base64').toString('binary')
					'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.password, 'binary').toString('base64')
				},
				simple: false,
				resolveWithFullResponse: true
			};

			request(options, function (error, response, body) {
				// console.log('error:', error); // Print the error if one occurred
				// console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				// console.log('body:', body); // Print the HTML for the Google homepage.

				if(body.access_token)
				{
					//Erfolg
					config.oauth = body;
					config.oauth.access_token_expiry = new Date(now.getTime() + 3600000).toISOString();
					config.oauth.refresh_token_expiry = new Date(now.getTime() + 30*24*3600 * 1000).toISOString();

					// Workaround for https://github.com/elasticio/sailor-nodejs/issues/57
					if (emitter && emitter.emit) {
						emitter.emit('updateKeys', config);
					}

					console.log(`Successfully retrieved updated tokens.  Access token expires at ${config.oauth.access_token_expiry}.
					Refresh token expires at ${config.oauth.refresh_token_expiry}`);

					resolve(config.oauth.access_token);
				}
				else
				{
					reject("Could not retrieve AccessToken with provided Credentials: " + JSON.stringify(body));
				}
			}).then(() => {}, reject);
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
	 * @param {string}	rest_path
	 * @param {string}	method		(GET || POST || PUT)
	 * @param {Object}	body			for POST/PUT requests
	 * @param {boolean}	is_log		prevent recursion
	 * @returns {Promise<Object>} response body
	 */
	this.makeRequest = function makeRequest(rest_path, method, body, is_log = false) {
		return auth()
		.then(accessToken =>{
			console.log('about make request');
			return request({
				followAllRedirects: true,
				url: buildUrl(rest_path),
				method: method,
				json: true,
				body: body,
				headers: {
					Authorization: "Bearer " + accessToken
				},
				simple: false,
				resolveWithFullResponse: true
			})
			.then((resourceResponse) => {
				console.log('DR Response: ' + JSON.stringify(resourceResponse));
				if (!is_log)
					this.log(resourceResponse);

				if (resourceResponse.body.ack === "success" || resourceResponse.body.ack === "warning")
					return resourceResponse.body;
				else
					//TODO: Warum kommt das geworfene Objekt im Sailor nicht an???
					throw new Error(resourceResponse);
			})
		});
	};

	this.log = async function log(data) {
		return await this.makeRequest('sleep', 'POST', data, true);
	}

	this.webhookStartup = async function webhookStartup(section, eventToListenTo) {
		return await this.makeRequest('admin/event/handler', 'POST', {
			event_handler: {
				type: {
					id: eventToListenTo
				},
				action: {
					id: 'notification',
					required: {
						url: process.env.ELASTICIO_FLOW_WEBHOOK_URI,
						format: 'post',
						target_name: 'elastic.io handler'
					}
				},
				section: section
			}
		});
	};
	this.webhookShutdown = async function webhookShutdown(eventHandlerId) {
		return await this.makeRequest('admin/event/handler/' + eventHandlerId, 'DELETE', {});
	};

	this.createOrder = async function createOrder(order) {
		//Felder die beim Anlegen keinen Sinn ergeben entfernen.
		if(order)
		{
			delete order.id;
			delete order.date;
			delete order.invoice_number;
			delete order.platform;
			delete order.history;
			delete order.invoice_amount;
			if(order.status)
			{
				delete order.status.initial_contact_date;
				delete order.status.paid_date;
				delete order.status.packed_date;
				delete order.status.shipped_date;
				delete order.status.arrived_date;
				delete order.status.cancelled_date;
			}
			delete order.bill_url
		}
		return await this.makeRequest('order', 'POST', {order:order});
	}

	// console.log('End construct Dreamrobot');

	return this;
};