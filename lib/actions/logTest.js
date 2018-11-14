"use strict";
const DreamRobot = require('./../dreamrobot');

// //Start
// module.exports.startup = async function startup(cfg) {
// 	console.log('getNewCustomer - startup');
// };
//
// //Initialisierung (???)
// module.exports.init = async function (cfg) {
// 	console.log('getNewCustomer - init');
// };

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	console.log('getNewCustomer - process');
	console.log('getNewCustomer - Message: ' + JSON.stringify(message));

	const dr = new DreamRobot(cfg, this);
	await dr.log(message);
};

// //Ende
// module.exports.shutdown = async function shutdown(cfg, startData) {
// 	console.log('getNewCustomer - shutdown');
// };