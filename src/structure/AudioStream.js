"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter {
  constructor(data) {
    super();

    this.streamType = data.streamType;
    this.manager = data.manager;
    this.device = data.device;
    this.host = data.device.host;
    this.channel = data.CHANNEL;
	this.key = `${this.host}/${this.channel}`;

    this.lowStatus = false;
    this.clipStatus = false;

    this.channels = new Map();
  }

  async update(data) {
    let changed = false;
	
	if (this.streamType === "SRC") {
		if (this.name !== data.PSNM) {
          this.name = data.PSNM;
          changed = true;
        }

        if (this.address !== data.RTPA) {
          this.address = data.RTPA;
          changed = true;
        }
	} else if (this.streamType === "DST") {
		if (this.name !== data.NAME) {
          this.name = data.NAME;
          changed = true;
        }
	}

    return changed;
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