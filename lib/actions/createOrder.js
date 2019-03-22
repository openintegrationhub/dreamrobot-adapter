"use strict";
const DreamRobot = require('./../dreamrobot');
const to = require('await-to-js').default;

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

	if(message.body.order)
	{
		let err, dr_ret;
		const dr = new DreamRobot(cfg, this);
		[err, dr_ret] = await to(dr.createOrder(message.body.order));
		console.log("dr_ret: %j",dr_ret)
		if(dr_ret && dr_ret.order.id) {
			delete message.body;
			message.body.order.id = dr_ret.order.id;
			this.emit('data', message);
		}
		else if(err)
			throw new Error(err);
		else
			throw new Error("An Undifined Error occured while communicating with DreamRobot.");
	}
	else
	{
		console.log('createOrder - processMessage: ERROR invalid message');
		throw new Error ('invalid message');
	}
};

// //Ende
// module.exports.shutdown = async function shutdown(cfg, startData) {
// 	console.log('createOrder - shutdown');
// };