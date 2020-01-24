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
            let previousValue = this.value;
            this.value = value;
			if (this.value=="L" || (this.value=="l" && previousValue=="h")) {
				this.emit("low");
			} else if (this.value=="H" || (this.value=="h" && previousValue=="l")) {
				this.emit("high");
			}

			if (this.value!==previousValue) {
				this.emit("change");
			}
        }
    }

    toString(){
        return `${this.gpio.toString()}-${this.id}`;
    }
}

module.exports = GpioPin;
