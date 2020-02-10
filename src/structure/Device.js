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
			ERRORED: 5,
			READY: 6
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

	async handleData(LwrpData){
		if (!LwrpData) return;

		LwrpData.device = this;

		switch (LwrpData.VERB) {
			case "VER":
				this.state = Device.STATE.READY;
				this.version = LwrpData.LWRP;
				this.devName = LwrpData.DEVN;
				this.srcCount = isNaN(LwrpData.NSRC) ? LwrpData.NSRC : Number(LwrpData.NSRC);
				this.dstCount = isNaN(LwrpData.NDST) ? LwrpData.NDST : Number(LwrpData.NDST);
				this.gpiCount = isNaN(LwrpData.NGPI) ? LwrpData.NGPI : Number(LwrpData.NGPI);
				this.gpoCount = isNaN(LwrpData.NGPO) ? LwrpData.NGPO : Number(LwrpData.NGPO);
				this.initProperties();
				this.lwrp.run();
				break;
			case "ERROR":
				console.log(LwrpData.raw);
				break;
			case "SRC":
				if (this.manager) this.manager.handleSourceData(LwrpData);
				break;
			case "DST":
				if (this.manager) this.manager.handleDestinationData(LwrpData);
				break;
			case "GPI":
				if (this.manager) this.manager.handleGpiData(LwrpData);
				break;
			case "GPO":
				if (this.manager) this.manager.handleGpoData(LwrpData);
				break;
			case "MTR":
				if (this.manager) this.manager.handleMtrData(LwrpData);
				// if (data.TYPE==="ICH") {
				// 	let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
				// 	if (src) src.setMeter(data);
				// } else if (data.TYPE==="OCH") {
				// 	let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
				// 	if (dst) dst.setMeter(data);
				// }
				break;
			case "LVL":
				if (this.manager) this.manager.handleLvlData(LwrpData);
				break;
		}
	}

	stop() {
		this.lwrp.stop();
	}

	write(message){
		if (
			[
				Device.STATE.RUNNING,
				Device.STATE.READY
			].includes(this.state)
		) this.lwrp.write(message);
	}

	toObject() {
		return {
			host: this.host,
			name: this.devName || "Axia Device",
			state: this.state
		};
	}

	toString() {
		return this.host;
	}
}

module.exports = Device;
