"use strict";
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

	console.log(JSON.stringify(credentials));
	// console.dir(credentials);

	// if (!credentials.username || !credentials.password) {
	//     throw new Error('API key is missing');
	// }

	const dr_ret = DreamRobot.makeRequest('system/scope', 'GET').then(data => console.log(JSON.stringify(data)));
	console.log(JSON.stringify(dr_ret));

	return TRUE;

	throw new Error(JSON.stringify(dr_ret));

	// if the request succeeds, we can assume the api key is valid
	return dr_ret;
}