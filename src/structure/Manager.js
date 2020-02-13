"use strict";

const dgram = require("dgram");
const { Socket } = require("net");
const { EventEmitter } = require("events");

const Device = require("./Device");
const Source = require("./Source");
const Destination = require("./Destination");
const Gpi = require("./Gpi");
const Gpo = require("./Gpo");

class Manager extends EventEmitter {
	constructor (options = {}) {
		super();
		this.init(options);
	}

	init(options) {
		if (this.devices) this.devices.clear();
		if (this.sources) this.sources.clear();
		if (this.destinations) this.destinations.clear();
		if (this.gpis) this.gpis.clear();
		if (this.gpos) this.gpos.clear();

		// option variables
		this.lwAdAutoinit = options.lwAdAutoinit || false;
		this.lwrpPort = options.lwrpPort || 93;
		this.lwAdPort = options.lwAdPort || 4001;
		this.lwAdMcast = options.lwAdMcast || "239.192.255.3";

		// instance variables
		this.devices = new Map(); // some devices, especially discovered, will not be initialized. run device.initialize() to start them
		this.sources = new Map();
		this.destinations = new Map();
		this.gpis = new Map();
		this.gpos = new Map();
	}

	initDiscovery() {
		this.socket = dgram.createSocket({
			type: "udp4",
			reuseAddr: true
		});

		this.socket
			.on("listening",()=>{
				this.emit("lwAdListening");
			})
			.on("message", (data,rinfo) => {
				this.addAddress(rinfo.address, this.lwAdAutoinit);
			})
			.on("error", err => {
				this.emit("lwAdError", err);
			});

		this.socket.bind(this.lwAdPort, () => {
			this.socket.addMembership(this.lwAdMcast);
			this.emit("lwAdReady");
		});
	}

	validAddress(options = {}) {
		let host = options.host;
		let port = options.port || 93;
		let retries = options.retries || 3;
		let reconnectInterval = options.reconnectInterval || 1000;

		return new Promise((resolve, reject) => {
			if (!host) reject("Need host to check address");

			let socket = Socket();
			let currentTries = retries;

			socket.on("connect", () => {
				resolve(true);
				socket.destroy();
			});

			socket.on("error", SocketError => {
				switch (SocketError.code) {
					case "ECONNREFUSED":
						resolve(false);
						socket.destroy();
						break;
					default:
						if (currentTries <= 0) {
							resolve(false);
							socket.destroy();
						} else {
							currentTries--;
							setTimeout(() => {
								socket.connect(port, host);
							}, reconnectInterval);
						}
						break;
				}
			});

			socket.connect(port, host);
		});
	}

	addAddress(address, initialize = true) {
		if (this.devices.has(address)) {
			return this.devices.get(address);
		} else {
			return this.addDevice({
				host: address,
				initialize: initialize,
				manager: this
			});
		}
	}

	async removePropertiesByHost(host) {
		// remove properties tied with this address
		this.sources.forEach((source, id) => {
			if (source.host == host) {
				this.sources.delete(id);
			}
		});

		this.destinations.forEach((destination, id) => {
			if (destination.host == host) {
				this.destinations.delete(id);
			}
		});

		this.gpis.forEach((gpi, id) => {
			if (gpi.host == host) {
				this.gpis.delete(id);
			}
		});

		this.gpos.forEach((gpo, id) => {
			if (gpo.host == host) {
				this.gpos.delete(id);
			}
		});
	}

	removeAddress(address) {
		if (this.devices.has(address)) {
			this.removePropertiesByHost(address);
			let device = this.devices.get(address);
			if (device && device.lwrp) device.stop();
			this.devices.delete(address);
		}
	}

	/**
   * DeviceData:
   *  manager: Manager, this manager
   *  host: String, IP address
   *  initialize: Boolean, whether to initialize device after adding
   **/
	addDevice(DeviceData) {
		let device = new Device(DeviceData);
		if (!device) return null;

		this.devices.set(device.host, device);
		this.emit("device-change");
		this.emit("devices", this.devices);

		device.on("connecting", () => {
			this.emit("device-change");
			this.emit("connecting");
		});

		device.on("error", () => {
			this.emit("device-change");
		});

		device.on("run", () => {
			this.emit("device-change");
			this.emit("run");
		});

		device.on("pause", () => {
			this.emit("device-change");
			this.emit("pause");
		});

		device.on("stop", () => {
			this.removeAddress(device.host);
			this.emit("device-change");
		});

		return device;
	}

	get dSTATE() {
		return Device.STATE;
	}

	getSourceByRtpa(rtpa) {
		if (!rtpa || rtpa=="" || rtpa=="0.0.0.0" || rtpa=="255.255.255.255") return null;

		let srcFound = null;
		this.sources.forEach(src => {
			if (src.address === rtpa) srcFound = src;
		});
		return srcFound;
	}

	async applySource(src) {
		this.destinations.forEach(dst => {
			if (dst.address === src.address && !dst.source) {
				dst.setSource(src);
			}
		});
	}

	createSource(LwrpData) {
		LwrpData.manager = this;
		let src = new Source(LwrpData);

		src.on("low", SourceData => {
			this.sources.set(SourceData.key, SourceData);
			this.emit("source.low", SourceData);
		});

		src.on("no-low", SourceData => {
			this.sources.set(SourceData.key, SourceData);
			this.emit("source.no-low", SourceData);
		});

		src.on("clip", SourceData => {
			this.sources.set(SourceData.key, SourceData);
			this.emit("source.clip", SourceData);
		});

		src.on("no-clip", SourceData => {
			this.sources.set(SourceData.key, SourceData);
			this.emit("source.no-clip", SourceData);
		});

		src.on("change", SourceData => {
			this.sources.set(SourceData.key, SourceData);
			this.emit("source", SourceData);
		});

		src.on("subscribe", SubData => {
			this.emit("subscribe", SubData);
		});

		src.on("unsubscribe", SubData => {
			this.emit("unsubscribe", SubData);
		});

		// check if a dst is using this src rtpa
		this.applySource(src);

		this.emit("new-source", src);
		this.sources.set(src.key, src);
		return src;
	}

	createDestination(LwrpData) {
		LwrpData.manager = this;
		let dst = new Destination(LwrpData);

		dst.on("change", DestinationData => {
			this.destinations.set(DestinationData.key, DestinationData);
			this.emit("destination", DestinationData);
		});

		dst.setSource(this.getSourceByRtpa(dst.address));

		this.emit("new-destination", dst);
		this.destinations.set(dst.key, dst);
		return dst;
	}

	createGpi(LwrpData) {
		LwrpData.manager = this;
		let gpi = new Gpi(LwrpData);

		gpi.on("change", GpiData => {
			this.gpis.set(GpiData.key, GpiData);
			this.emit("gpi", GpiData);
		});

		this.emit("new-gpi", gpi);
		this.gpis.set(gpi.key, gpi);
		return gpi;
	}

	createGpo(LwrpData) {
		LwrpData.manager = this;
		let gpo = new Gpo(LwrpData);

		gpo.on("change", GpoData => {
			this.gpio.set(GpoData.key, GpoData);
			this.emit("gpo", GpoData);
		});

		this.emit("new-gpo", gpo);
		this.gpos.set(gpo.key, gpo);
		return gpo;
	}

	handleSourceData(LwrpData) {
		let src = this.sources.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);

		if (src) {
			src.update(LwrpData);
		} else {
			src = this.createSource(LwrpData);
		}

		this.emit("sources", this.sources);
	}

	handleDestinationData(LwrpData) {
		let dst = this.destinations.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);

		if (dst) {
			dst.update(LwrpData);
		} else {
			dst = this.createDestination(LwrpData);
		}

		this.emit("destinations", this.destinations);
	}

	handleGpiData(LwrpData) {
		for (let i = 1; i <= LwrpData.VALUE.length; i++) {
			LwrpData.PIN = i;
			let gpi = this.gpis.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}-${LwrpData.PIN}`);

			if (gpi) {
				gpi.update(LwrpData);
			} else {
				gpi = this.createGpi(LwrpData);
			}

			this.emit("gpis", this.gpis);
		}
	}

	handleGpoData(LwrpData) {
		for (let i = 1; i <= LwrpData.VALUE.length; i++) {
			LwrpData.PIN = i;
			let gpo = this.gpos.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}-${LwrpData.PIN}`);

			if (gpo) {
				gpo.update(LwrpData);
			} else {
				gpo = this.createGpo(LwrpData);
			}

			this.emit("gpos", this.gpos);
		}
	}

	handleMtrData(LwrpData) {
		let stream;

		if (LwrpData.TYPE === "ICH") {
			stream = this.sources.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);
		} else if (LwrpData.TYPE === "OCH") {
			stream = this.destinations.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);
		}

		if (!stream) return;

		stream.handleMtr(LwrpData);
	}

	handleLvlData(LwrpData) {
		let stream;

		if (LwrpData.TYPE === "ICH") {
			stream = this.sources.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);
		} else if (LwrpData.TYPE === "OCH") {
			stream = this.destinations.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);
		}

		if (!stream) return;

		stream.handleLvl(LwrpData);
	}

	handleLvlData(LwrpData) {
		switch(LwrpData.TYPE) {
			case "ICH":
				let src = this.sources.get(`${LwrpData.device.host}/${LwrpData.CHANNEL}`);
				if (src) src.setLevelInfo(LwrpData.FORM, LwrpData.SIDE);
				break;
			case "OCH":
				// 	let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
				// 	if (dst) dst.setLevelInfo(data.FORM,data.SIDE);
				break;
		}
	}
}

module.exports = Manager;
