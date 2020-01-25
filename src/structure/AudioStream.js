"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter {
	constructor(LwrpData) {
		super();

		this.type = LwrpData.type;
		this.manager = LwrpData.manager;
		this.device = LwrpData.device;
		this.host = LwrpData.device.host;
		this.channel = LwrpData.CHANNEL;
		this.key = `${this.host}/${this.channel}`;

		this.lowStatus = false;
		this.clipStatus = false;

		this.channels = new Map();
	}

	handleMtrData(LwrpData) {
		let peeks = LwrpData.PEEK.split(":");
		if (peeks) {
			// TODO: confirm or optimize
			this.emit("meter", {
				stream: this.toObject(),
				left: peeks[0],
				right: peeks[1]
			});
		}
	}

	handleLvlData(LwrpData) {
		switch(LwrpData.FORM) {
			case "LOW":
				this.lowStatus = true;
				this.emit("silence", this);
				break;
			case "NO-LOW":
				this.lowStatus = false;
				this.emit("audio", this);
				break;
			case "CLIP":
				this.clipStatus = true;
				this.emit("clip", this);
				break;
			case "NO-CLIP":
				this.clipStatus = false;
				this.emit("no-clip", this);
				break;
		}
	}

	toObject() {
		let json = {
			type: this.type,
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
