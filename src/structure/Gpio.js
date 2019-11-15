"use strict";

const GpioPin = require("./GpioPin");
const {EventEmitter} = require("events");

class Gpio extends EventEmitter{
    constructor(data){
        super();

        this.gpioType = data.gpioType;
        this.manager = data.manager;
        this.device = data.device;
        this.channel = data.channel;

        this.pins = new Map();
    }

    createGpioPin(PinData){
        let pin = new GpioPin(PinData);

        pin
            .on("change",_=>{
                this.emit("change",{
                    gpio: this,
                    pin: pin
                })
            })
            .on("low",_=>{
                this.emit("low",{
                    gpio: this,
                    pin: pin
                })
            })
            .on("high",_=>{
                this.emit("high",{
                    gpio: this,
                    pin: pin
                })
            });

        this.pins.set(pin.id,pin);
        pin.update(PinData.value);
        return pin;
    }

    update(data){
        this.value = data.VALUE;
        this.value.split("").forEach((v,i)=>{
            let id = i+1;
            let pin = this.pins.get(id);
            if (!pin) {
                pin = this.createGpioPin({
                    gpio: this,
                    id: id,
                    value: v
                });
            }
            pin.update(v);
        });
    }

    toString(){
        return `${this.device.host}/${this.channel}`;
    }
}

module.exports = Gpio;
