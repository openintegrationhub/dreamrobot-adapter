"use strict";
const DreamRobot = require('./../dreamrobot');

//Start
module.exports.startup = async function startup(cfg) {
	console.log('getNewCustomer - startup');

	// const dr = new DreamRobot(cfg, this);
	// let ret = await dr.webhookStartup('customer', 'created');
	//
	// return {eventHandlerId: ret.event_handler_id};
};

//Initialisierung (???)
module.exports.init = async function (cfg) {
	console.log('getNewCustomer - init');
	// console.log(cfg);
};

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	console.log('getNewCustomer - process');
	console.log('getNewCustomer - Message: ' + JSON.stringify(message));

	const dr = new DreamRobot(cfg, this);
	await dr.log(message);
};

//Ende
module.exports.shutdown = async function shutdown(cfg, startData) {
	console.log('getNewCustomer - shutdown');

	// const dr = new DreamRobot(cfg, this);
	// return await dr.webhookShutdown(startData.eventHandlerId);
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