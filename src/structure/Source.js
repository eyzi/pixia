"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream {
  constructor(data) {
    data.streamType = "SRC";
    super(data);

    this.subscribers = new Map();
  }

  async update(data) {
    let changed = await super.update(data);

    if (changed) {
      // emit change
      this.emit("change", this);
    }
  }

  subscribe(dst) {
    this.emit("subscribe",{
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