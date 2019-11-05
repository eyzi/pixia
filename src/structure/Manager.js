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
        device.on("source",src=>{
            this.handleSource(src);
        });
        return device;
    }

    async findSource(address){
        let src = this.sources.get(address);
    }

    handleSource(src){
        this.sources.set(src.address,src);
    }
}

module.exports=Manager;
