"use strict";

const dgram = require("dgram");
const { Socket } = require("net");
const { EventEmitter } = require("events");

const Device = require("./Device");
const Source = require("./Source");
const Destination = require("./Destination");

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
		let reconnectInterval = options.reconnectInterval || 3000;

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
							socket.connect(host, port);
						}, reconnectInterval);
					}
					break;
				}
			});

			socket.connect(host, port);
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
		if (!this.devices.has(address)) {
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

		device.on("connecting", () => {
			this.emit("connecting");
		});

		device.on("run", () => {
			this.emit("run");
		});

		device.on("pause", () => {
			this.emit("pause");
		});

		device.on("stop", () => {
			this.removeAddress(device.host);
		});

		return device;
	}

	getSourceByRtpa(rtpa) {
		if (!rtpa || rtpa=="" || rtpa=="0.0.0.0" || rtpa=="255.255.255.255") return null;

		let srcFound = null;
		this.sources.forEach(src => {
			if (src.address === rtpa) srcFound = src;
		});
		return srcFound;
	}

	handleSourceData(data) {
		let src = this.sources.get(`${data.device.host}/${data.CHANNEL}`);
		if (src) {
			src.update(data);
		} else {
			src = this.createSource(data);
		}
	}

	createSource(data) {
		data.manager = this;
		let src = new Source(data);
		this.sources.set(`${data.device.host}/${data.CHANNEL}`, src);
	}

	handleDestinationData(data) {
		let dst = this.destinations.get(`${data.device.host}/${data.CHANNEL}`);
		if (dst) {
			dst.update(data);
		} else {
			dst = this.createDestination(data);
		}
	}

	createDestination(data) {
		data.manager = this;
		let dst = new Destination(data);
		this.destinations.set(`${data.device.host}/${data.CHANNEL}`, dst);
	}

	handleGpiData(data) {
		// TODO
	}

	handleGpoData(data) {
		// TODO
	}
}

module.exports = Manager;
