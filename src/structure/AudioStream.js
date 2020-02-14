"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter {
  constructor(LwrpData) {
    super();

    this.streamType = LwrpData.streamType;
    this.chType = LwrpData.chType;
    this.manager = LwrpData.manager;
    this.device = LwrpData.device;
    this.host = LwrpData.device.host;
    this.channel = LwrpData.CHANNEL;
	  this.key = `${this.host}/${this.channel}`;

    this.lowStatus;
    this.clipStatus;

    this.lowLevel = -800;
    this.lowTime = 3000;
    this.clipLevel = 0;
    this.clipTime = 3000;

    this.channels = new Map();
  }

  setLevel({
    lowLevel = this.lowLevel,
    lowTime = this.lowTime,
    clipLevel = this.clipLevel,
    clipTime = this.clipTime
  }) {
    this.lowLevel = lowLevel;
    this.lowTime = lowTime;
    this.clipLevel = clipLevel;
    this.clipTime = clipTime;

    let msg = `LVL ${this.chType} ${this.channel} LOW.LEVEL=${this.lowLevel} LOW.TIME=${this.lowTime} CLIP.LEVEL=${this.clipLevel} CLIP.TIME=${this.clipTime}`;
    console.info(`Sending to ${this.device.host}: "${msg}"`);
    this.device.write(msg);
  }

  setLevelInfo(form, side) {
    switch (form.toUpperCase()) {
      case "LOW":
        if (typeof this.lowStatus === "undefined") {
          this.lowStatus = true;
          this.emit("low", this); // remove to not emit on first assignment
        } else if (!this.lowStatus) {
          this.lowStatus = true;
          this.emit("low", this);
        }
        break;
      case "NO-LOW":
        if (typeof this.lowStatus === "undefined") {
          this.lowStatus = false;
          this.emit("no-low", this); // remove to not emit on first assignment
        } else if (this.lowStatus) {
          this.lowStatus = false;
          this.emit("no-low", this);
        }
        break;
      case "CLIP":
        if (typeof this.clipStatus === "undefined") {
          this.clipStatus = true;
          this.emit("clip", this); // remove to not emit on first assignment
        } else if (!this.clipStatus) {
          this.clipStatus = true;
          this.emit("clip", this);
        }
        break;
      case "NO-LOW":
        if (typeof this.clipStatus === "undefined") {
          this.clipStatus = false;
          this.emit("no-clip", this); // remove to not emit on first assignment
        } else if (this.clipStatus) {
          this.clipStatus = false;
          this.emit("no-clip", this);
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
