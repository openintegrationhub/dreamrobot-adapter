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

	if(message.body.order)
	{
		const dr = new DreamRobot(cfg, this);
		let dr_ret = await dr.createOrder(message.body.order).catch(error => {throw new Error(error);});
		if(dr_ret.order_id)
			this.emit('data', dr_ret.order_id);
		else
			throw new Error(dr_ret);
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