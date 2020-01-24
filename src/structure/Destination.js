"use strict";

const AudioStream = require("./AudioStream");
const Source = require("./Source");

class Destination extends AudioStream {
  constructor(data) {
    data.streamType = "SRC";
    super(data);
	
	this.name = data.NAME;
	let parsedAddr = data.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
	this.address = parsedAddr ? parsedAddr[0] : null;
    this.source = null;
  }

  async update(data) {
    let changed = await super.update(data);
    
    let parsedAddr = data.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
    let newAddress = parsedAddr ? parsedAddr[0] : null;

    if (this.address !== newAddress) {
      if (newAddress) {
        let src = this.manager.getSourceByRtpa(this.address);
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