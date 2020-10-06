"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream {
	constructor(LwrpData) {
		LwrpData.type = "SRC";
		super(LwrpData);

		this.name = LwrpData.PSNM;
		this.address = LwrpData.RTPA;
		this.subscribers = new Map();

		this.setLevel({});
	}

	async update(LwrpData) {
		let changed = false;

		if (this.name !== LwrpData.PSNM) {
			this.name = LwrpData.PSNM;
			changed = true;
		}

		if (this.address !== LwrpData.RTPA) {
			this.address = LwrpData.RTPA;
			changed = true;
		}

		if (changed) {
			// emit change
			this.emit("change", this);
		}
	}

	subscribe(dst) {
		this.emit("subscribe", {
			src: this,
			dst: dst
		});
		this.subscribers.set(dst.toString(), dst);
	}

	unsubscribe(dst) {
		this.emit("unsubscribe", {
			src: this,
			dst: dst
		});
		this.subscribers.delete(dst.toString());
	}
}

module.exports = Source;
