"use strict";

const {EventEmitter} = require("events");
const Device = require("./Device");

class Manager extends EventEmitter{
    constructor(){
        super();

        this.devices = new Map();
        // TODO
    }

    addDevice(data){
        if (!data.host) return;
        console.log(`Adding Device ${data.host}`);
        let device = new Device({
            ...data,
            manager: this
        });
        this.devices.set(data.host,device);
        return device;
    }
}

module.exports=Manager;
