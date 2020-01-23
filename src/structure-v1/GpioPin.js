"use strict";

const {EventEmitter} = require("events");

class GpioPin extends EventEmitter{
    constructor(data){
        super();

        this.gpio = data.gpio;
        this.id = data.id;
    }

    update(value){
        if (this.value!==value){
            this.value = value;
            this.emit("change");
            switch (this.value) {
                case "L":
                    this.emit("low");
                    break;
                case "H":
                    this.emit("high");
                    break;
            }
        }
    }

    toString(){
        return `${this.gpio.toString()}-${this.id}`;
    }
}

module.exports = GpioPin;
