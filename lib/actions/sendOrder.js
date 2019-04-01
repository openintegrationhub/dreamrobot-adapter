"use strict";
const DreamRobot = require('./../dreamrobot');
const to = require('await-to-js').default;
const { messages } = require('elasticio-node');

// //Start
// module.exports.startup = async function startup(cfg) {
// 	console.log('sendOrder - startup');
// };
//
// //Initialisierung (???)
// module.exports.init = async function (cfg) {
// 	console.log('sendOrder - init');
// };

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	console.log('sendOrder - processMessage: ' + JSON.stringify(message));

	if(message.body.order)
	{
		let err, dr_ret;
		const dr = new DreamRobot(cfg, this);
		message.body.order.user = cfg.username;
		[err, dr_ret] = await to(dr.sendOrder(message.body.order));
		console.log("dr_ret: %j", dr_ret);
		if(dr_ret && dr_ret.order_id) {
			this.emit('data', messages.newMessageWithBody({order:{id:dr_ret.order_id,user:cfg.username}}));
		}
		else if(err)
			throw err;
		else
			throw new Error("An Undifined Error occured while communicating with DreamRobot.");
	}
	else
	{
		console.log('sendOrder - processMessage: ERROR invalid message');
		throw new Error ('invalid message');
	}
};

// //Ende
// module.exports.shutdown = async function shutdown(cfg, startData) {
// 	console.log('sendOrder - shutdown');
// };