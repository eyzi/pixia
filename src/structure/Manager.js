"use strict";

const {EventEmitter} = require("events");
const Device = require("./Device");

class Manager extends EventEmitter{
    constructor(){
        super();

        this.devices = new Map();
        this.sources = new Map();
    }

    addDevice(data){
        if (!data.host) return;
        console.log(`Adding Device ${data.host}`);
        let device = new Device({
            ...data,
            manager: this
        });
        this.devices.set(data.host,device);
        device.on("ready",_=>{
            console.log(`${device.name} is ready`)
            device.getSources();
            device.getDestinations();
            device.getGpis();
            device.getGpos();
        });
        device.on("data",data=>{
            if (device.hasCommand("MTR")) {
                this.emit("data",data);
            } else if (
                device.srcCount==device.sources.size &&
                device.dstCount==device.destinations.size
            ) {
                device.getMeters();
            }
        });
        device.on("source",src=>{
            this.handleSource(src);
        });
        device.on("destination",dst=>{
            this.handleDestination(dst);
        });
        device.on("gpi",gpi=>{
            this.handleGpi(gpi);
        });
        device.on("gpo",gpo=>{
            this.handleGpo(gpo);
        });
        device.on("meter",meter=>{
            this.handleMeter(meter);
        });
        return device;
    }

    removeDevice(host){
        let device = this.devices.get(host);
        if (device) {
            device.stop();
            this.devices.delete(host);
        }
    }

    async findSource(address){
        let src = this.sources.get(address);
        if (src) return src;
        else return null;
    }

    async handleSource(src){
        let srcCheck = this.sources.get(src.address);
        if (srcCheck) return;
        this.sources.set(src.address,src);
        this.devices.forEach(device=>{
            device.destinations.forEach(dst=>{
                dst.fixSource();
            });
        });

        this.emit('source',src);
    }

    async handleDestination(dst){
        if (typeof dst.source=='string') {
            let src = this.sources.get(dst.source);
            if (src) {
                dst.subscribe(src);
            }
        }

        this.emit('destination',dst);
    }

    async handleGpi(gpi){
        this.emit('gpi',gpi);
    }

    async handleGpo(gpo){
        this.emit('gpo',gpo);
    }

    async handleMeter(meter){
        this.emit('meter',meter);
    }
}

module.exports=Manager;
