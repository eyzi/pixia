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

    this.lowStatus;
    this.clipStatus;

    this.channels = new Map();
  }

  setLevelInfo(form, side) {
    switch (form.toUpperCase()) {
      case "LOW":
        if (typeof this.lowStatus === "undefined") {
          this.lowStatus = true;
          this.emit("low"); // remove to not emit on first assignment
        } else if (!this.lowStatus) {
          this.lowStatus = true;
          this.emit("low");
        }
        break;
      case "NO-LOW":
        if (typeof this.lowStatus === "undefined") {
          this.lowStatus = false;
          this.emit("no-low"); // remove to not emit on first assignment
        } else if (this.lowStatus) {
          this.lowStatus = false;
          this.emit("no-low");
        }
        break;
      case "CLIP":
        if (typeof this.clipStatus === "undefined") {
          this.clipStatus = true;
          this.emit("clip"); // remove to not emit on first assignment
        } else if (!this.clipStatus) {
          this.clipStatus = true;
          this.emit("clip");
        }
        break;
      case "NO-LOW":
        if (typeof this.clipStatus === "undefined") {
          this.clipStatus = false;
          this.emit("no-clip"); // remove to not emit on first assignment
        } else if (this.clipStatus) {
          this.clipStatus = false;
          this.emit("no-clip");
        }
        break;
    }
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