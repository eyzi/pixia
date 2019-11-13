"use strict";

const {EventEmitter} = require("events");

class AudioStream extends EventEmitter{
    constructor(data){
        this.streamType = data.streamType;
        this.manager = data.manager;
        this.device = data.device;
        this.channel = data.CHANNEL;

        this.name = null;
        this.address = null;
    }

    toString(){
        return `${this.device.host}/${this.channel}`;
    }
}

module.exports = AudioStream;
