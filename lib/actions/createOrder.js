"use strict";
const DreamRobot = require('./../dreamrobot');

// //Start
// module.exports.startup = async function startup(cfg) {
// 	console.log('createOrder - startup');
// };
//
// //Initialisierung (???)
// module.exports.init = async function (cfg) {
// 	console.log('createOrder - init');
// };

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	console.log('createOrder - processMessage: ' + JSON.stringify(message));

	//TODO:
	const dr = new DreamRobot(cfg, this);
	dr.log(message).then(this.emit('data', message)).catch(this.emit('error', 'logging failed'));
};

// //Ende
// module.exports.shutdown = async function shutdown(cfg, startData) {
// 	console.log('createOrder - shutdown');
// };