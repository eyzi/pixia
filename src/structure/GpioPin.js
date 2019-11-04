"use strict";

const {EventEmitter} = require('events');

/**
 * Axia GPIO pin
 */
class GpioPin extends EventEmitter{
	constructor(data){
        super();
		this.id = data.id;
		this.gpio = data.gpio;
		this.state = data.state; // h, l, H, L
	}

    set state(state){
        let prevState = this.state;
        this.state = state;
        if (prevState!==this.state) {
            this.emit("change",this.state);
        }
        switch(this.state){
            case "h": case "H":
                this.emit("high");
                break;
            case "l": case "L":
                this.emit("low");
                break;
        }
    }

    isOn(){
        switch(this.state){
            case "h": case "H":
                return true;
                break;
            case "l": case "L": default:
                return false;
                break;
        }
    }

	toString(){
		return `${this.gpio.device.host}/${this.gpio.channel}-${this.id}`;
	}
}

module.exports=GpioPin;
