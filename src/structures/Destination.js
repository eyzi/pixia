"use strict";

/**
 * Axia device destination
 */
class Destination{
	constructor(data){
		super();
		this.channel = data.channel;
		this.name = data.name;
		this.device = data.device;
        this.source = data.source;
		this.level = new Map();
	}

	toString(){
		return this.channel;
	}
}

module.exports = Destination;
