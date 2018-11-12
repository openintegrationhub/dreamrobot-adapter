"use strict";
const DreamRobot = require('./../dreamrobot');
var dr;

// module.exports = getNewCustomer;
//
// /**
//  * Executes the verification logic by sending a simple to the Petstore API using the provided apiKey.
//  * If the request succeeds, we can assume that the apiKey is valid. Otherwise it is not valid.
//  *
//  * @param credentials object to retrieve apiKey from
//  *
//  * @returns Promise sending HTTP request and resolving its response
//  */
// function getNewCustomer(credentials) {
// 	try {
// 		// console.log(credentials);
// 		// console.log(process.version);
// 		const dr = new DreamRobot(credentials, this);
// 		// console.dir(credentials);
//
// 		// if (!credentials.username || !credentials.password) {
// 		//     throw new Error('API key is missing');
// 		// }
//
// 		console.log("Trying to retrieve some API Data (verify credentials)");
// 		let promise = dr.makeRequest('system/scope', 'GET');
//
// 		promise./*catch((e) => {
// 			console.log("Catch-Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e)));
// 			return TRUE;//Fehler
// 		}).*/then((e) => {
// 			console.log("Then-Msg: " + JSON.stringify(e, Object.getOwnPropertyNames(e)));
// 			return TRUE;//Fehler
// 		})
//
// 		return promise;
//
// 		/*.then(function(dr_ret) {
//
// 			console.log("dr_ret: " + JSON.stringify(dr_ret));
// 			return dr_ret;
// 		});*/
// 		// return true;//OK
// 	}
// 	catch (e) {
// 		console.log("Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e)));
// 		return TRUE;//Fehler
// 	}
//
// 	// if the request succeeds, we can assume the api key is valid
// 	// return dr_ret;
// }

//Start
module.exports.startup = async function startup(cfg) {
	// console.log('startp getNewCustomer...');
	// const dr = new DreamRobot(cfg, this);
	dr = new DreamRobot(cfg, this);
	let ret = await dr.webhookStartup('customer', 'created');
	dr.eventHandlerId = ret.event_handler_id;
};

//Aktion
module.exports.process = async function ProcessTrigger(msg) {
	this.emitData("123 EH-ID: " + dr.eventHandlerId);
	console.log("123 EH-ID: " + dr.eventHandlerId);
	// this.emitData(msg);
};

//Ende
module.exports.shutdown = async function shutdown(cfg, startData) {
	// const dr = new DreamRobot(cfg, this);
	return await dr.webhookShutdown(dr.eventHandlerId);
};












module.exports.getMetaModel = async function getMetaModel(cfg) {
	// const dr = new DreamRobot(cfg, this);
	return await dr.buildOutSchemaForModule(cfg.module);
};

//???
module.exports.modules = async function getModules(cfg) {
	// const dr = new DreamRobot(cfg, this);
	return await dr.getModules(true);
};