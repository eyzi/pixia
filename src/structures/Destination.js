"use strict";

const {EventEmitter} = require('events');

/**
 * Axia device destination
 */
class Destination extends EventEmitter {
	constructor(data){
		super();
		this.channel = data.channel;
		this.device = data.device;
		this.level = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = Destination;
