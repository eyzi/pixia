"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream{
    constructor(data){
        data.streamType = "SRC";
        super(data);
        this.subscribers = new Map();
    }

    update(data){
        let changed = false;

        if (this.name!=data.NAME) {
            this.name = data.NAME;
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
}

module.exports = Source;
