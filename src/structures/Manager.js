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
            this.log(`${device.name} is running`);
            device.getSources();
            device.getDestinations();
            device.getGPOs();
            device.getGPIs();
            //device.getMeters();
            //device.getLevels();
        });
        device.on("data",data=>{
            switch(data.VERB) {
                case "SRC":
                    this.refreshSources();
                    this.handleData();
                    break;
                case "BEGIN": case "END": default:
                    break;
            }
            if (!this.allReady && device.isReady()) {
                this.emit("ready.device",device);
            } else {
                this.handleData(data);
                this.emit("data.lwrp",data);
            }
        });
        this.devices.set(device.host,device);
        return device;
    }

    async refreshSources(){
        this.devices.forEach(async device=>{
            device.destinations.forEach(async dst=>{
                if (dst.source && typeof dst.source==='string') {
                    let src = this.getSource(this.source);
                    if (src) {
                        dst.source = src;
                        src.addSub(this);
                    }
                }
            });
        });
    }

    handleData(data){

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
        this.emit("log",message);
    }
}

module.exports = Manager;
