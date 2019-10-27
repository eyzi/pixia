"use strict";

const {EventEmitter} = require('events');

/**
 * Axia GPIO pin
 */
class IOPin extends EventEmitter {
	constructor(data){
		super();
		this.id = data.id;
		this.gpio = data.gpio;
		this.type = data.type;
		this.value = data.value; // h, l, H, L
	}

	toString(){
		return this.id;
	}
}

module.exports = IOPin;
