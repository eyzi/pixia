"use strict";

const Device = require("./Device");
const Station = require("./Station");
const {EventEmitter} = require("events");
const LwrpDiscovery = require("../util/LwrpDiscovery");

const Source = require("./Source");

class Manager extends EventEmitter{
    constructor(options={}){
        super();
        this.init(options);
    }

    init(options={}) {
        this.stations = new Map();
        this.devices = new Map();
        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();

        this.initDiscovery(options.autoadd || false);
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
                    device.stop();
                    device.removeAllListeners();
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
                })
                .on("meter",data=>{
                    this.emit("meter",data);
                })
                .on("subscribe",data=>{
                    this.emit("subscribe",data);
                })
                .on("unsubscribe",data=>{
                    this.emit("unsubscribe",data);
                });
        });
    }

    addStation(StationData){
        StationData.manager = this;

        let stn = new Station(StationData);
        if (stn) {
            this.stations.set(stn.name,stn);
        }

        return stn;
    }

    getSource(rtpa){
        if (!rtpa || rtpa=="" || rtpa=="0.0.0.0" || rtpa=="255.255.255.255") return null;

        let srcFound = null;
        this.sources.forEach(src=>{
            if (src.address==rtpa) srcFound=src;
        });
        return srcFound;
    }

    handleDst(dst) {
        this.emit("destination",dst);

        this.stations.forEach(stn=>{
            stn.updateDestination(dst);
        });
    }

    handleSrc(src) {
        this.destinations.forEach(dst=>{
            if (!dst.source && dst.address) {
                let src = this.getSource(dst.address);
                if (src) dst.setSource(src);
            }
        });

        this.emit("source",src);

        this.stations.forEach(stn=>{
            stn.updateSource(src);
        });
    }

    handleGpi(gpi) {
        this.emit("gpi",gpi);

        this.stations.forEach(stn=>{
            stn.updateGpi(gpi);
        });
    }

    handleGpo(gpo) {
        this.emit("gpo",gpo);

        this.stations.forEach(stn=>{
            stn.updateGpo(gpo);
        });
    }

    addAddress(address){
        if (this.discovery) this.discovery.addAddress(address);
    }

    removeAddress(address){
        let d = this.devices.get(address)
        if (d) {
            d.stop()
            d.removeAllListeners()
        }
        this.devices.delete(address)
        if (this.discovery) this.discovery.removeAddress(address);
    }

    initDiscovery(autoadd=false){
        this.discovery = new LwrpDiscovery(autoadd);

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
