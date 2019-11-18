"use strict";

const AudioStream = require("./AudioStream");
const Source = require("./Source");

class Destination extends AudioStream{
    constructor(data){
        data.streamType = "DST";
        super(data);
        this.source = null;
    }

    update(data){
        super.update(data);

        let changed = false;

        if (this.name!=data.NAME) {
            this.name = data.NAME;
            changed = true;
        }

        if (data.ADDR) {
            let parsedAddr = data.ADDR.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
            if (!parsedAddr && this.source) {
                this.source = null;
                changed = true;
            } else if (parsedAddr) {
                if (!this.source) {
                    changed = true;
                } else if (this.source.address==parsedAddr[0]) {
                    this.source = null;
                    changed = true;
                }
            }
        }

        if (changed) {
            this.emit("change",this);
            return true;
        } else {
            return false;
        }
    }

    setSource(src){
        if (this.source instanceof Source) {
            this.source.unsubscribe(this);
        }
        this.source = null;
        if (src instanceof Source) {
            src.subscribe(this);
        }
    }
}

module.exports = Destination;
