"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter {
  constructor(data) {
    super();

    this.streamType = data.streamType;
    this.manager = data.manager;
    this.device = data.device;
    this.host = data.host;
    this.channel = data.channel;
    this.name = data.name;
    this.address = data.address || null;

    this.lowStatus = false;
    this.clipStatus = false;

    this.channels = new Map();
  }

  async update(data) {
    let changed = false;
    
    switch (this.streamType) {
      case "DST":
        if (this.name !== data.NAME) {
          this.name = data.NAME;
          changed = true;
        }
        break;
      case "SRC":
        if (this.name !== data.PSNM) {
          this.name = data.PSNM;
          changed = true;
        }

        if (this.address !== data.RTPA) {
          this.address = data.RTPA;
          changed = true;
        }
        break;
    }

    return changed;
  }

  toObject() {
    let json = {
      streamType: this.streamType,
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
    return `${this.host}/${this.channel}`;
  }
}

module.exports = AudioStream;