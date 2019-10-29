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
        this.sourcesReady = false;
	}

    addDevice(data) {
        let deviceData = {
            manager: this,
            name: data.name || "Axia Device",
            host: data.host || "127.0.0.1",
            port: data.port || 93,
            pass: data.pass || "",
            reconnect: data.reconnect || 5000,
            pollInterval: data.pollInterval || 200
        };
        let device = new Device(deviceData);
        device.on("connected",_=>{
            device.run();
        });
        device.on("ready",_=>{
            device.getSources();
        });
        device.on("data",data=>{
            this.deviceData(data);
        });
        this.devices.set(device.host,device);
        return device;
    }

    checkSources() {
        let allReady = true;
        this.devices.forEach(d=>{
            if (!d.isReady('sources'))
                allReady = false;
        });
        if (!this.sourcesReady && allReady) {
            this.log(`All sources are now ready.`);
            this.sourcesReady = true;
            this.log(`Getting destinations of devices.`);
            this.devices.forEach(d=>{
                d.getDestinations();
            });
        }
    }

    handleData(data){

    }

    deviceData(data){
        console.log(data.VERB);
        if (!this.sourcesReady) {
            return this.checkSources();
        } else {
            return this.handleData(data);
        }
    }

    getSource(rtpa){
        return new Promise((resolve,reject)=>{
            this.devices.forEach(d=>{
                if (!d.sources) return;
                d.sources.forEach(s=>{
                    if (s.rtpa==rtpa) {
                        resolve(s);
                    }
                });
            });
        });
    }

    async removeDevice(deviceIp) {
        this.devices.delete(deviceIp);
    }

    log(message){
        console.log(message);
    }
}

module.exports = Manager;
