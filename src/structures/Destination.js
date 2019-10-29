"use strict";

/**
 * Axia device destination
 */
class Destination{
	constructor(data){
		this.channel = data.channel;
		this.name = data.name;
		this.device = data.device;
        this.source = null;
		this.level = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = Destination;
