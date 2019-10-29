"use strict";

const Pin = require("./Pin");

/**
 * Axia device GPI
 */
class Gpi{
	constructor(data){
        this.type = "GPI";
		this.channel = data.channel;
		this.device = data.device;
		this.pins = new Map();
	}

    async addPin(id,value="l"){
        let pin = new Pin({
            id: id,
            gpio: this,
            value: value
        });
        this.pins.set(id,pin);
    }

	toString(){
		return this.channel;
	}
}

module.exports = Gpi;
