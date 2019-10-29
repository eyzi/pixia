"use strict";

/**
 * Axia device source
 */
class Source{
	constructor(data){
		this.channel = data.channel;
		this.name = data.name;
		this.device = data.device;
        this.subscribers = new Map();
		this.levels = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = Source;
