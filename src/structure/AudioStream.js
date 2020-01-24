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