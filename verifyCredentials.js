"use strict";
// const request = require('request-promise');
const request = require('request-promise');
const DreamRobot = require('./lib/dreamrobot');

module.exports = verify;

/**
 * Executes the verification logic by sending a simple to the Petstore API using the provided apiKey.
 * If the request succeeds, we can assume that the apiKey is valid. Otherwise it is not valid.
 *
 * @param credentials object to retrieve apiKey from
 *
 * @returns Promise sending HTTP request and resolving its response
 */
function verify(credentials) {
	try {
		console.log(credentials);
		const dr = new DreamRobot(credentials, undefined);
		// console.dir(credentials);

		// if (!credentials.username || !credentials.password) {
		//     throw new Error('API key is missing');
		// }
		return dr.makeRequest('system/scope', 'GET')/*.then(function(dr_ret) {
			console.log("dr_ret: " + JSON.stringify(dr_ret));
			return dr_ret;
		});*/
		// return true;//OK
	}
	catch (e) {
		console.log("Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e)));
		return TRUE;//Fehler
	}

	// if the request succeeds, we can assume the api key is valid
	// return dr_ret;
}