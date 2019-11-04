"use strict";

const GpioPin = require("./GpioPin");
const LwrpData = require("../util/LwrpData");

/**
 * Axia GPIO channel
 */
 class Gpio{
 	constructor(data){
        this.raw = data.raw;
        this.type = data.type;
        this.device = data.device;
        this.channel = data.channel;

        this.pins = new Map();

        data.states.split("").forEach((state,index)=>{
            let pin = new GpioPin({
                gpio: this,
                id: index+1, // index starts at 0
                state: state
            });
            this.pins.set(id,pin);
        });
 	}

    static parse(raw){
        let dataArray = LwrpData.delimit(raw);
        let verb = dataArray.shift();
        let channel = dataArray.shift();
        let states = dataArray.shift();
        return {verb,channel,states};
    }

    // TODO write change state to device lwrp
    writePin(id,state="l"){
        let stateString = "";
        for (let i=1;i<this.pins.size+1;i++) {
            stateString += (i==id)?state:"x";
        }
        this.device.write(`${this.type} ${this.channel} ${stateString}`);
    }

 	toString(){
 		return `${this.device.host}/${this.gpio.channel}`;
 	}
 }

 module.exports=Gpio;
