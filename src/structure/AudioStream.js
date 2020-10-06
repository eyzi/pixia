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
    this.lowTime = 0;
    this.clipLevel = 0;
    this.clipTime = 0;

    this.silenceThreshold = 0;
    this.silenceWaiter = null;

    this.channels = new Map();
  }

  setSilenceThreshold(value = this.silenceThreshold) {
    this.silenceThreshold = value;
  }

  handleSilence(silence) {
    if (silence !== this.lowStatus && !this.silenceWaiter) {
      this.silenceWaiter = setTimeout(_ => {
        this.lowStatus = silence;
        this.emit('');
        if (silence) {
          this.emit('low', this);
        } else {
          this.emit('no-low', this);
        }
        clearTimeout(this.silenceWaiter);
        this.silenceWaiter = null;
      }, this.silenceThreshold);
    } else if (this.silenceWaiter && silence === this.lowStatus) {
      clearTimeout(this.silenceWaiter);
      this.silenceWaiter = null;
    }
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

    let msg = `LVL ${this.chType} ${this.channel} CLIP.LEVEL:${this.clipLevel} CLIP.TIME:${this.clipTime} LOW.LEVEL:${this.lowLevel} LOW.TIME:${this.lowTime}`;
    console.info(`Sending to ${this.device.host}: "${msg}"`);
    this.device.write(msg);
  }

  setLevelInfo(form, side) {
    switch (form.toUpperCase()) {
      
      /** LOW */
      case "LOW":
        // if (typeof this.lowStatus === "undefined") {
        //   this.lowStatus = true;
        //   this.emit("low", this); // remove to not emit on first assignment
        // } else if (!this.lowStatus) {
        //   this.lowStatus = true;
        //   this.emit("low", this);
        // }
        this.handleSilence(true);
        break;
      case "NO-LOW":
        // if (typeof this.lowStatus === "undefined") {
        //   this.lowStatus = false;
        //   this.emit("no-low", this); // remove to not emit on first assignment
        // } else if (this.lowStatus) {
        //   this.lowStatus = false;
        //   this.emit("no-low", this);
        // }
        this.handleSilence(false);
        break;

      /** CLIP */
      case "CLIP":
        if (typeof this.clipStatus === "undefined") {
          this.clipStatus = true;
          this.emit("clip", this); // remove to not emit on first assignment
        } else if (!this.clipStatus) {
          this.clipStatus = true;
          this.emit("clip", this);
        }
        break;
      case "NO-CLIP":
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
