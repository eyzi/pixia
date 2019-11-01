"use strict";

/**
 * Axia GPIO pin
 */
class Pin{
	constructor(data){
		this.id = data.id;
		this.gpio = data.gpio;
		this.value = data.value; // h, l, H, L
	}

	toString(){
		return this.id;
	}
}

module.exports = Pin;
