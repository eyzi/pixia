"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream{
    constructor(data){
        data.streamType = "SRC";
        super(data);
        this.subscribers = new Map();
    }

    async update(data){
        await super.update(data);

        let changed = false;

        if (this.name!=data.PSNM) {
            this.name = data.PSNM;
            changed = true;
        }

        if (this.address!=data.RTPA) {
            this.address = data.RTPA;
            changed = true;
        }

        if (changed) {
            this.emit("change",this);
            return true;
        } else {
            return false;
        }
    }

    subscribe(dst){
        this.subscribers.set(dst.toString(),dst);
        this.emit("subscribe",{
            src: this,
            dst: dst
        });
    }

    unsubscribe(dst){
        this.subscribers.delete(dst.toString());
        this.emit("unsubscribe",{
            src: this,
            dst: dst
        });
    }
}

module.exports = Source;
