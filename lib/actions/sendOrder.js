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
	const appUid = process.env.AppUid;
	const oihUid = message.body.meta.oihUidEncrypted;

	if(message.body.data.order)
	{
		let err, dr_ret;
		const dr = new DreamRobot(cfg, this);

		[err, dr_ret] = await to(dr.sendOrder(message.body.data.order));
		console.log(`DREAMROBOT dr_ret: ${JSON.stringify(dr_ret)}`);
		const meta = {
			recordUid: dr_ret.order_id,
			applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
			oihUidEncrypted: (oihUid!=undefined && oihUid!=null) ? oihUid : 'oihUidEncrypted not set yet',
		};

		const processActionResponse = {
			meta,
			data: message.body.data
		}
		if(dr_ret && dr_ret.order_id) {
			this.emit('data', messages.newMessageWithBody(processActionResponse));
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