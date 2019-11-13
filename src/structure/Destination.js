"use strict";

const AudioStream = require("./AudioStream");

class Destination extends AudioStream{
    constructor(data){
        data.streamType = "SRC";
        super(data);
        this.source = null;
    }

    update(data){
        let changed = false;

        if (this.name!=data.NAME) {
            this.name = data.NAME;
            changed = true;
        }

        if (this.address!=data.ADDR) {
            this.address = data.ADDR;
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

module.exports = Destination;
