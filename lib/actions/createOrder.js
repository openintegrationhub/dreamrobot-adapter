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
		if(dr_ret.order_id)
			this.emit('data', dr_ret.order_id);
		else
			throw new Error(err);
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