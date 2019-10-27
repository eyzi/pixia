"use strict";

const {EventEmitter} = require('events');

/**
 * Controller of multiple Axia devices
 */
class Controller extends Event Emitter {
	constructor(data){
		super();
		this.devices = new Map();
	}
}

module.exports = Controller;
