"use strict";

const {EventEmitter} = require("events");
const Device = require("./Device");

/**
 * Manager of multiple Axia devices
 */
class Manager extends EventEmitter {
	constructor(data){
		super();
		this.devices = new Map();
	}

    async createDevice(data) {
        let deviceData = {
            name: data.name || "Axia Device",
            host: data.host || "127.0.0.1",
            port: data.port || 93,
            pass: data.pass || "",
            reconnect: data.reconnect || 5000,
            pollInterval: data.pollInterval || 200
        };
        let device = new Device(deviceData);
        this.devices.set(device.host,device);
    }

    async removeDevice(deviceIp) {
        this.devices.delete(deviceIp);
    }
}

module.exports = Manager;
