"use strict";

const {EventEmitter} = require('events');

/**
 * An Axia device that uses lwrp
 */
class Device extends EventEmitter {
	constructor(data){
		super();
		this.name = data.name || "Axia Device";
		this.host = data.host || "127.0.0.1";
		this.port = data.port || 93;
		this.pass = data.pass || "";

		this.reconnect = data.reconnect || 5000;
		this.pollInterval = options.pollInterval || 200;

		this.sources = new Map();
		this.destinations = new Map();
		this.gpis = new Map();
		this.gpos = new Map();

		/* Polling variables */

		this.socket = net.Socket();

		this.socket
			.on("data",data=>{
				data.toString().split("\r\n").forEach(chunk=>{
					let toEmit = this.parseData(chunk);

					if (toEmit) {
						this.updateProp.bind(this)(toEmit).catch(console.error);
						this.emit("data",toEmit);
					}
				});
			});

	}

	async parseData(chunk) {
		let data = {};
		return this;
	}

	login(password){
		return this.write(`LOGIN ${password}`);
	}

	write(message){
		if (!this.socket) return this;
		this.socket.write(`${message}\r\n`);
		return this;
	}

	toString(){
		return this.name;
	}
}

module.exports = Device;
