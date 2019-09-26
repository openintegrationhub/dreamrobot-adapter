"use strict";
const DreamRobot = require('./../dreamrobot');
const messages = require('elasticio-node').messages;
// const options = {
// 	'eventHandlerId': 0
// }

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
	console.log('getNewCustomer - startup');

	const dr = new DreamRobot(cfg, this);
	let ret = await dr.webhookStartup('customer', 'created');

	return {eventHandlerId: ret.event_handler_id};
};

//Initialisierung (???)
module.exports.init = async function ProcessInit(cfg) {
	console.log('getNewCustomer - init');
	// console.log(cfg);
};

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	const self = this;
	const iamToken = process.env.iamToken;
	
	console.log('getNewCustomer - process');
	console.log('getNewCustomer - Message: ' + JSON.stringify(message));

	if(message.body.customer_id)
	{
		const dr = new DreamRobot(cfg, this);
		message.body.customer =  (await dr.makeRequest('admin/customer/' + message.body.customer_id, 'GET', {})).customer;

		console.log(`DREAMROBOT RESPONSE after makeRequest: ${JSON.stringify(message)}`);
		console.log(`The customer_id: ${message.body.customer_id}`);

		const getApplicationUid = {
			uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
			json: true,
			headers: {
				"Authorization" : `Bearer ${iamToken}`,
				}
		};
	
		const applicationUidResponse = await request.get(getApplicationUid);
	
		const appUid = applicationUidResponse.data.applicationUid;
	
		let meta = {
			applicationUid: (appUid!=undefined || appUid!=null) ? appUid : 'appUid not set yet',
			iamToken: (iamToken!=undefined || iamToken!=null) ? iamToken : 'iamToken not set yet',
			recordUid: message.body.customer_id,
		};

		console.log(`Meta Object: ${JSON.stringify(meta)}`);

		delete message.body.customer_id;
		const body = message.body;
		
		let contentWithMeta = {
                meta,
                data: body
        };
		
		console.log(`DREAMROBOT OBJECT to be emitted afterwards: ${JSON.stringify(body)}`);
		console.log(`COMPLETE OBJECT to be emitted afterwards: ${JSON.stringify(contentWithMeta)}`);

		self.emit('data', messages.newMessageWithBody(contentWithMeta));
	}
};

//Ende
module.exports.shutdown = async function shutdown(cfg, startData) {
	console.log('getNewCustomer - shutdown');

	const dr = new DreamRobot(cfg, this);
	return await dr.webhookShutdown(startData.eventHandlerId);
};





























module.exports.getMetaModel = async function getMetaModel(cfg) {
	const dr = new DreamRobot(cfg, this);
	return await dr.buildOutSchemaForModule(cfg.module);
};

//???
module.exports.modules = async function getModules(cfg) {
	const dr = new DreamRobot(cfg, this);
	return await dr.getModules(true);
};