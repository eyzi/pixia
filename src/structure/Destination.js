"use strict";

const AudioStream = require("./AudioStream");
const Source = require("./Source");

class Destination extends AudioStream{
    constructor(data){
        data.streamType = "DST";
        super(data);
        this.source = null;
    }

    async update(data){
        await super.update(data);

        let changed = false;

        if (this.name!=data.NAME) {
            this.name = data.NAME;
            changed = true;
        }

        if (this.address && !data.ADDR) {
			// gone silent
			this.setSource(null);
			this.address = null;
			changed = true;
		} else if (data.ADDR) {
            let parsedAddr = data.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
            let oldAddr = this.address;
            this.address = (parsedAddr) ? parsedAddr[0] : null;
            if (oldAddr!=this.address) {
                let src = this.manager.getSource(this.address);
                this.setSource(src);
                changed = true;
            }
        }

        if (changed) {
            this.emit("change",this);
            return true;
        } else {
            return false;
        }
    }

    setSource(src=null){
        if (this.source && this.source instanceof Source) {
            this.source.unsubscribe(this);
            this.source = null;
        }

        this.source = src;
        if (src instanceof Source) {
            src.subscribe(this);
        }
    }

    setName(name=null){
        if (!name) name=`DST ${this.channel}`;
        this.device.write(`DST ${this.channel} NAME:"${name}"`);
    }

    setAddress(address=""){
        this.device.write(`DST ${this.channel} ADDR:"${address}"`);
    }
}

module.exports = Destination;
