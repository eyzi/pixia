"use strict";

const { EventEmitter } = require("events");
const LwrpSocket = require("./LwrpSocket");

class Device extends EventEmitter {
	constructor(DeviceData = {}) {
		super();

		this.host = DeviceData.host || "127.0.0.1";
		this.port = DeviceData.port || 93;
		this.pass = DeviceData.pass || "";

		this.state = Device.STATE.NONE;

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

		this.initLwrp();
	}

	static get STATE() {
		return {
			NONE: 0,
			INITIALIZED: 1,
			CONNECTING: 2,
			RUNNING: 3,
			PAUSED: 4
		};
	}

	initLwrp() {
		this.lwrp = new LwrpSocket(this);

		lwrp.on("connecting", _ => {
			this.state = Device.STATE.CONNECTING;
			this.emit("connecting");
		});

		lwrp.on("data", data => {
			this.handleData();
		});

		lwrp.on("run", _ => {
			this.state = Device.STATE.RUNNING;
			this.emit("run");
		});
		
		lwrp.on("pause", _ => {
			this.state = Device.STATE.PAUSED;
			this.emit("pause");
		});

		lwrp.on("stop", _ => {
			this.lwrp = null;
			this.emit("stop");
		});
	}

	allowedMeter(){
		return this.devName !== "VX Engine" && (this.srcCount>0 || this.dstCount>0);
	}

	async handleData(data={}){
		if (!data) return;

		switch (data.VERB) {
			case "VER":
				this.version = data.LWRP;
				this.devName = data.DEVN;
				this.srcCount = isNaN(data.NSRC) ? data.NSRC : Number(data.NSRC);
				this.dstCount = isNaN(data.NDST) ? data.NDST : Number(data.NDST);
				this.gpiCount = isNaN(data.NGPI) ? data.NGPI : Number(data.NGPI);
				this.gpoCount = isNaN(data.NGPO) ? data.NGPO : Number(data.NGPO);
				this.emit("valid");
				break;
			case "ERROR":
				console.log(data.raw);
				break;
			case "SRC":
				let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
				if (!src) {
					src = this.createSource({
						manager: this.manager,
						device: this,
						channel: data.CHANNEL
					});
				}
				src.update(data);
				break;
			case "DST":
				let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
				if (!dst) {
					dst = this.createDestination({
						manager: this.manager,
						device: this,
						channel: data.CHANNEL
					});
				}
				dst.update(data);
				break;
			case "GPI":
				let gpi = this.gpis.get(`${this.host}/${data.CHANNEL}`);
				if (!gpi) {
					gpi = this.createGpi({
						manager: this.manager,
						device: this,
						channel: data.CHANNEL
					});
				}
				gpi.update(data);
				break;
			case "GPO":
				let gpo = this.gpos.get(`${this.host}/${data.CHANNEL}`);
				if (!gpo) {
					gpo = this.createGpo({
						manager: this.manager,
						device: this,
						channel: data.CHANNEL
					});
				}
				gpo.update(data);
				break;
			case "MTR":
				if (data.TYPE==="ICH") {
					let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
					if (src) src.setMeter(data);
				} else if (data.TYPE==="OCH") {
					let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
					if (dst) dst.setMeter(data);
				}
				break;
			case "LVL":
				if (data.TYPE==="ICH") {
					let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
					if (src) src.setLevelInfo(data.FORM,data.SIDE);
				} else if (data.TYPE==="OCH") {
					let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
					if (dst) dst.setLevelInfo(data.FORM,data.SIDE);
				}
				this.emit('level', {
					type: data.TYPE,
					key: `${this.host}/${data.CHANNEL}`,
					device: this.host,
					channel: data.CHANNEL,
					side: data.SIDE,
					form: data.FORM
				})
				break;
		}
	}

	stop() {
		this.lwrp.stop();
	}

	write(message){
		this.lwrp.write(message);
	}

	toString() {
		return this.host;
	}
}

module.exports = Device;