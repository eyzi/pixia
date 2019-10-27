"use strict";

const {EventEmitter} = require('events');

/**
 * Axia device source
 */
class Source extends EventEmitter {
	constructor(data){
		this.channel = data.channel;
		this.device = data.device;
		this.levels = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = Source;
