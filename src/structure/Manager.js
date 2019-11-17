"use strict";

const Device = require("./Device");
const Station = require("./Station");
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
                    this.handleSrc(src);
                    this.emit("sources",this.sources);
                })
                .on("destination",dst=>{
                    this.destinations.set(dst.toString(),dst);
                    this.handleDst(dst);
                    this.emit("destinations",this.destinations);
                })
                .on("gpi",data=>{
                    this.gpis.set(data.gpio.toString(),data.gpio);
                    this.handleGpi(data.gpio);
                    this.emit("gpis",this.gpis);
                })
                .on("gpo",data=>{
                    this.gpos.set(data.gpio.toString(),data.gpio);
                    this.handleGpo(data.gpio);
                    this.emit("gpos",this.gpos);
                });
        });
    }

    addStation(StationData){
        StationData.manager = this;

        if (StationData.sources) {
            StationData.sources.forEach((rtpa,i)=>{
                let src = this.sources.get(rtpa);
                if (src) {
                    StationData.sources.splice(i,1,src);
                }
            });
        }

        if (StationData.destinations) {
            StationData.destinations.forEach((addr,i)=>{
                let dst = this.destinations.get(addr);
                if (dst) {
                    StationData.destinations.splice(i,1,dst);
                }
            });
        }

        if (StationData.gpis) {
            StationData.gpis.forEach((id,i)=>{
                let gpi = this.gpis.get(id);
                if (gpi) {
                    StationData.gpis.splice(i,1,gpi);
                }
            });
        }

        if (StationData.gpos) {
            StationData.gpos.forEach((id,i)=>{
                let gpo = this.gpos.get(id);
                if (gpo) {
                    StationData.gpos.splice(i,1,gpo);
                }
            });
        }

        let stn = new Station(StationData);
        if (stn) {
            this.stations.set(stn.name,stn);
        }

        return stn;
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
        this.stations.forEach(stn=>{
            let foundDst = stn.destinations.get(dst.toString());
            if (typeof foundDst==="string") stn.addDestination(dst);
        });
    }

    handleSrc(src) {
        this.stations.forEach(stn=>{
            let foundSrc = stn.sources.get(src.toString());
            if (typeof foundSrc==="string") stn.addSource(src);
        });
    }

    handleGpi(gpi) {
        this.stations.forEach(stn=>{
            let foundGpi = stn.gpis.get(gpi.toString());
            if (typeof foundGpi==="string") stn.addGpi(gpi);
        });
    }

    handleGpo(gpo) {
        this.stations.forEach(stn=>{
            let foundGpo = stn.gpos.get(gpo.toString());
            if (typeof foundGpo==="string") stn.addGpo(gpo);
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
