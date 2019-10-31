"use strict";

const Pin = require("./Pin");

/**
 * Axia device GPO
 */
class Gpo{
	constructor(data){
        this.type = "GPO";
		this.channel = data.channel;
		this.device = data.device;
        this.raw = data.raw;
		this.pins = new Map();
	}

    setPin(id,value='l'){
        let p = this.pins.get(id);
        if (!p) {
            p = new Pin({
                gpio: this,
                id: id,
                value: value
            });
        }
        this.pins.set(id,p);
    }

    setStates(state){
        // divide string, each digit is one pin
        let stateArray = state.split('');
        stateArray.forEach((s,i)=>{
            this.setPin(i,s);
        });
    }

	toString(){
		return this.channel;
	}
}

module.exports = Gpo;
