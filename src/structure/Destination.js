"use strict";

const AudioStream = require("./AudioStream");
const Source = require("./Source");

class Destination extends AudioStream {
	constructor(LwrpData) {
		LwrpData.type = "DST";
		super(LwrpData);

		this.name = LwrpData.NAME;
		let parsedAddr = LwrpData.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
		this.address = parsedAddr ? parsedAddr[0] : null;
		this.source = null;

		this.setLevel({});
	}

	async update(LwrpData) {
		let changed = false;

		if (this.name !== LwrpData.NAME) {
			this.name = LwrpData.NAME;
			changed = true;
		}

		let parsedAddr = LwrpData.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
		let newAddress = parsedAddr ? parsedAddr[0] : null;

		if (this.address !== newAddress) {
			if (newAddress) {
				let src = this.manager.getSourceByRtpa(newAddress);
				this.setSource(src);
			} else {
				this.setSource(null);
			}

			changed = true;
		}

		if (changed) {
			// emit change
			this.emit("change", this);
		}
	}

	setSource(src = null){
		if (this.source && this.source instanceof Source) {
			this.source.unsubscribe(this);
			this.address = null;
			this.source = null;
		}

		this.source = src;
		if (src instanceof Source) {
			this.address = src.address;
			src.subscribe(this);
		}
	}

	setName(name = null) {
		if (!name) name=`DST ${this.channel}`;
		this.device.write(`DST ${this.channel} NAME:"${name}"`);
	}

	setAddress(address = ""){
		this.device.write(`DST ${this.channel} ADDR:"${address}"`);
	}
}

module.exports = Destination;
