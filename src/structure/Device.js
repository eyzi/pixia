"use strict";

const { EventEmitter } = require("events");
const LwrpSocket = require("./LwrpSocket");

class Device extends EventEmitter {
	constructor(DeviceData = {}) {
		super();

		this.manager = DeviceData.manager;
		this.host = DeviceData.host || "127.0.0.1";
		this.port = DeviceData.port || 93;
		this.pass = DeviceData.pass || "";

		this.state = Device.STATE.IDLE;

		// lwrp variables
		this.reconnect = DeviceData.reconnect || 1000;
		this.socketRetries = DeviceData.socketRetries || 3;
		this.pollInterval = DeviceData.pollInterval || 200;

		this.srcCount = null;
		this.dstCount = null;
		this.gpiCount = null;
		this.gpoCount = null;

		this.sources = new Map();
		this.destinations = new Map();
		this.gpis = new Map();
		this.gpos = new Map();

		if (DeviceData.initialize) {
			this.initLwrp();
		}
	}

	static get STATE() {
		return {
			IDLE: 0,
			INITIALIZING: 1,
			CONNECTING: 2,
			RUNNING: 3,
			PAUSED: 4,
			ERRORED: 5
		};
	}

	initialize() {
		this.initLwrp();
	}

	async initLwrp() {
		this.state = Device.STATE.INITIALIZING;
		this.lwrp = new LwrpSocket(this);

		this.lwrp.on("connecting", () => {
			this.state = Device.STATE.CONNECTING;
			this.emit("connecting");
		});

		this.lwrp.on("error", data => {
			this.state = Device.STATE.ERRORED;
			data.device = this.device;
			this.emit("error", data);
		});

		this.lwrp.on("data", data => {
			this.handleData(data);
		});

		this.lwrp.on("run", () => {
			this.state = Device.STATE.RUNNING;
			this.emit("run");
		});

		this.lwrp.on("pause", () => {
			this.state = Device.STATE.PAUSED;
			this.emit("pause");
		});

		this.lwrp.on("stop", () => {
			this.lwrp = null;
			this.emit("stop");
		});
	}

	initProperties() {
		if (this.srcCount > 0) this.write("SRC");
		if (this.dstCount > 0) this.write("DST");
		// if (this.gpiCount>0) this.write("ADD GPI");
		// if (this.gpoCount>0) this.write("ADD GPO");
		// if (this.allowedMeter()) this.lwrp.addCommand("MTR");
	}

	allowedMeter(){
		return this.devName !== "VX Engine" && (this.srcCount>0 || this.dstCount>0);
	}

	async handleData(data={}){
		if (!data) return;

		data.device = this;

		switch (data.VERB) {
			case "VER":
				this.version = data.LWRP;
				this.devName = data.DEVN;
				this.srcCount = isNaN(data.NSRC) ? data.NSRC : Number(data.NSRC);
				this.dstCount = isNaN(data.NDST) ? data.NDST : Number(data.NDST);
				this.gpiCount = isNaN(data.NGPI) ? data.NGPI : Number(data.NGPI);
				this.gpoCount = isNaN(data.NGPO) ? data.NGPO : Number(data.NGPO);
				this.initProperties();
				this.lwrp.run();
				break;
			case "ERROR":
				console.log(data.raw);
				break;
			case "SRC":
				if (this.manager) this.manager.handleSourceData(data);
				break;
			case "DST":
				if (this.manager) this.manager.handleDestinationData(data);
				break;
			case "GPI":
				if (this.manager) this.manager.handleGpiData(data);
				break;
			case "GPO":
				if (this.manager) this.manager.handleGpoData(data);
				break;
			case "MTR":
				// if (data.TYPE==="ICH") {
				// 	let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
				// 	if (src) src.setMeter(data);
				// } else if (data.TYPE==="OCH") {
				// 	let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
				// 	if (dst) dst.setMeter(data);
				// }
				break;
			case "LVL":
				// if (data.TYPE==="ICH") {
				// 	let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
				// 	if (src) src.setLevelInfo(data.FORM,data.SIDE);
				// } else if (data.TYPE==="OCH") {
				// 	let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
				// 	if (dst) dst.setLevelInfo(data.FORM,data.SIDE);
				// }
				// this.emit("level", {
				// 	type: data.TYPE,
				// 	key: `${this.host}/${data.CHANNEL}`,
				// 	device: this.host,
				// 	channel: data.CHANNEL,
				// 	side: data.SIDE,
				// 	form: data.FORM
				// });
				break;
		}
	}

	stop() {
		this.lwrp.stop();
	}

	write(message){
		if (this.state == Device.STATE.RUNNING) this.lwrp.write(message);
	}

	toString() {
		return this.host;
	}
}

module.exports = Device;
