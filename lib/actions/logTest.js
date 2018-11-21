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
	console.log('logTest - process');
	console.log('logTest - Message: ' + JSON.stringify(message));

	const dr = new DreamRobot(cfg, this);
	return await dr.log(message).then(this.emit('data', message.newMessageWithBody({"test":"test-Antwort"}))).catch(this.emit('error', 'logging failed'));
};

// //Ende
// module.exports.shutdown = async function shutdown(cfg, startData) {
// 	console.log('getNewCustomer - shutdown');
// };