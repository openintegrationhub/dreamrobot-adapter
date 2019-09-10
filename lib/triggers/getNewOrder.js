"use strict";
const DreamRobot = require('./../dreamrobot');

//TOODOOO...

//Start
module.exports.startup = async function startup(cfg) {
	console.log('getNewOrder - startup');

	const dr = new DreamRobot(cfg, this);
	let ret = await dr.webhookStartup('order', 'created');

	if(!ret.event_handler_id)
		throw new Error('Failed to create event-listener. DR Response: ' + JSON.stringify(ret));

	return {eventHandlerId: ret.event_handler_id};
};

//Initialisierung (???)
module.exports.init = async function ProcessInit(cfg) {
	console.log('getNewOrder - init');
	// console.log(cfg);
};

//Aktion
module.exports.process = async function ProcessTrigger(message, cfg) {
	console.log('getNewOrder - processMessage: ' + JSON.stringify(message));

	if(message.body.order_id)
	{
		const dr = new DreamRobot(cfg, this);
		let dr_ret = (await dr.makeRequest('order/' + message.body.order_id + '/', 'GET', {}));
		if(dr_ret.order)
		{
			dr_ret.order.user = cfg.username
			//TODO: Nicht immer die alte Message mit rumschleifen.
			// delete message.body;
			message.body.order = dr_ret.order;

			const appUid = process.env.AppUid;
			const iamToken = process.env.iamToken;

			let meta = {
				applicationUid: (appUid!=undefined && appUid!=null) ? appUid : 'appUid not set yet',
				iamToken: (iamToken!=undefined && iamToken!=null) ? iamToken : 'iamToken not set yet',
			};
	
			let contentWithMeta = {
					meta,
					data: message
			};

			this.emit('data', contentWithMeta);
		}
		else
		{
			// ~ kommt der vielleicht garnicht hierhin, weil ein Error direkt an dein Sailor durchgereicht würde?
			console.log('getNewOrder - processMessage: ERROR Response from DR: ' + JSON.stringify(dr_ret));
			throw new Error (dr_ret);
		}
	}
	else
	{
		console.log('getNewOrder - processMessage: ERROR invalid message');
		throw new Error ('invalid message');
	}
};

//Ende
module.exports.shutdown = async function shutdown(cfg, startData) {
	console.log('getNewOrder - shutdown');

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