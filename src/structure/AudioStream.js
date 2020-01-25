"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter {
	constructor(LwrpData) {
		super();

		this.streamType = LwrpData.streamType;
		this.manager = LwrpData.manager;
		this.device = LwrpData.device;
		this.host = LwrpData.device.host;
		this.channel = LwrpData.CHANNEL;
		this.key = `${this.host}/${this.channel}`;

		this.lowStatus = false;
		this.clipStatus = false;

		this.channels = new Map();
	}

	toObject() {
		let json = {
			streamType: this.streamType,
			key: this.key,
			host: this.host,
			channel: this.channel,
			name: this.name,
			address: this.address,
			lowStatus: this.lowStatus,
			clipStatus: this.clipStatus
		};
		return json;
	}

	toString() {
		return this.key;
	}
}

module.exports = AudioStream;
