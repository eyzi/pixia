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
                })
                .on("source",src=>{
                    this.sources.set(src.toString(),src);
                    //this.handleSrc(src);
                    this.emit("sources",this.sources);
                })
                .on("destination",dst=>{
                    this.destinations.set(dst.toString(),dst);
                    this.handleDst(dst);
                    this.emit("destinations",this.destinations);
                })
                .on("gpi",gpi=>{
                    this.gpis.set(gpi.toString(),gpi);
                    //this.handleGpi(gpi);
                    this.emit("gpis",this.gpis);
                })
                .on("gpo",gpo=>{
                    console.log(gpo);
                    this.gpos.set(gpo.toString(),gpo);
                    //this.handleGpo(gpo);
                    this.emit("gpos",this.gpos);
                });
        });
    }

    getSource(rtpa){
        if (!rtpa || rtpa=="" || rtpa=="0.0.0.0") return null;

        let srcFound = null;
        this.sources.forEach(src=>{
            if (src.address==rtpa) srcFound=src;
        });
        return srcFound;
    }

    handleDst(dst) {
        if (!dst.source || (dst.address && dst.address!=='' && dst.address==dst.source.address)) {
            let src = this.getSource();
            if (src) {
                dst.setSource(src);
            }
        }
    }

    addAddress(address){
        if (this.discovery) this.discovery.addAddress(address);
    }

    initDiscovery(){
        this.discovery = new LwrpDiscovery();

        this.discovery
            .on("address",address=>{
                // add a as device. device returns an object if successfully connected or null if not
                this.addDevice({host:address}).catch(console.error);
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
