"use strict";

const Device = require("./Device");
const {EventEmitter} = require("events");
const LwrpDiscovery = require("../util/LwrpDiscovery");

class Manager extends EventEmitter{
    constructor(){
        super();

        this.stations = new Map();
        this.devices = new Map();
        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();

        this.initDiscovery();
    }

    /*
        DeviceData
            name
            host
            port
            pass
    */
    addDevice(DeviceData){
        return new Promise((resolve,reject)=>{
            DeviceData.manager = this;
            let device = new Device(DeviceData);
            device
                .on("valid",_=>{
                    this.devices.set(device.host,device);
                    this.emit("device",device);

                    device.initProperties();

                    resolve(device);
                })
                .on("invalid",_=>{
                    this.devices.delete(device.host);
                    device = null;
                    reject(`Invalid Device`);
                });
        });
    }

    addAddress(address){
        if (this.discovery) this.discovery.addAddress(address);
    }

    initDiscovery(){
        this.discovery = new LwrpDiscovery();

        this.discovery
            .on("address",address=>{
                // add a as device. device returns an object if successfully connected or null if not
                this.addDevice({host:address});
            })
            .on("ready",_=>{
                console.log(`LWRP Discovery is ready`);
            })
            .on("listening",_=>{
                console.log(`LWRP Discovery is listening`);
            })
            .on("error",error=>{
                console.error(error);
            });
    }
}

module.exports = Manager;
