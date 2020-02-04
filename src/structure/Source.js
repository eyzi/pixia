"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream {
  constructor(data) {
    data.streamType = "SRC";
    super(data);

	  this.name = data.PSNM;
	  this.address = data.RTPA;
    this.subscribers = new Map();

    this.device.write(`LVL ICH ${this.channel} LOW.LEVEL=-800 LOW.TIME=1000 CLIP.LEVEL=0 CLIP.TIME=1000`);
  }

  async update(data) {
    let changed = false;

    if (this.name !== data.PSNM) {
      this.name = data.PSNM;
      changed = true;
    }

    if (this.address !== data.RTPA) {
      this.address = data.RTPA;
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