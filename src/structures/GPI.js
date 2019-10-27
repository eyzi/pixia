"use strict";

const {EventEmitter} = require('events');

/**
 * Axia device GPI
 */
class GPI extends EventEmitter {
	constructor(data){
		super();
		this.channel = data.channel;
		this.device = data.device;
		this.pins = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = GPI;
