"use strict";

const {EventEmitter} = require("events");

class AxiaGpio extends EventEmitter {
	constructor(LwrpData) {
		super();

		this.type = LwrpData.type;
		this.manager = LwrpData.manager;
		this.device = LwrpData.device;
		this.host = LwrpData.device.host;
		this.channel = LwrpData.CHANNEL;
		this.pin = LwrpData.PIN;
		this.key = `${this.host}/${this.channel}-${this.pin}`;

		this.state = this.getState(LwrpData.VALUE);
	}

	getState(AxiaGpioValue) {
		return AxiaGpioValue.substring(this.pin - 1, this.pin);
	}

	async update(LwrpData) {
		let changed = false;

		let oldState = this.state;
		let newState = this.getState(LwrpData.VALUE);
		this.state = newState === "x" ? oldState : newState;

		if (oldState !== this.state) {
			changed = true;
			switch(this.state) {
				case "L":
					this.emit("going-low", this);
					break;
				case "H":
					this.emit("going-high", this);
					break;
				case "l":
					this.emit("low", this);
					break;
				case "h":
					this.emit("high", this);
					break;
			}
		}

		if (changed) {
			// emit change
			this.emit("change", this);
		}
	}

	setValue(value) {
		if (!["l", "L", "h", "H"].includes(value)) return;

		let setValue = "";
		for (let i = 0; i < 5; i++) {
			setValue += (i === this.pin - 1) ? value : "x";
		}
		console.info(`Sending to ${this.device.host}: "${this.type} ${this.channel} ${setValue}"`);
		this.device.write(`${this.type} ${this.channel} ${setValue}`);
	}

	toObject() {
		let json = {
			type: this.type,
			key: this.key,
			host: this.host,
			channel: this.channel,
			pin: this.pin,
			state: this.state
		};
		return json;
	}

	toString() {
		return this.key;
	}
}

module.exports = AxiaGpio;
