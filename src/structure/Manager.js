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
            if (
                device.srcCount==device.sources.size &&
                device.dstCount==device.destinations.size &&
                !device.hasCommand("MTR")
            ) {
                device.getMeters();
            }
            this.emit("data",data);
        });
        device.on("source",src=>{
            this.handleSource(src);
        });
        return device;
    }

    async findSource(address){
        let src = this.sources.get(address);
        if (src) return src;
        else return address;
    }

    async handleSource(src){
        let srcCheck = this.sources.get(src.address);
        if (srcCheck) return;

        this.sources.set(src.address,src);
        this.devices.forEach(device=>{
            device.destinations.forEach(dst=>{
                if (typeof dst.address=='string' && dst.address==src.address) {
                    src.addSub(dst);
                }
            });
        });
    }
}

module.exports=Manager;
