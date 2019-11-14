"use strict";

const {EventEmitter} = require("events");
const AudioChannel = require("./AudioChannel");

class AudioStream extends EventEmitter{
    constructor(data){
        super();

        this.streamType = data.streamType;
        this.manager = data.manager;
        this.device = data.device;
        this.channel = data.channel;

        this.name = null;
        this.address = null;

        this.channels = new Map();
    }

    initChannels(){
        switch(this.chCount){
            case 0:
                break;
            case 2:
                let leftCh = new AudioChannel({id:'left'});
                this.channels.set(leftCh.id,leftCh);
                let rightCh = new AudioChannel({id:'right'});
                this.channels.set(rightCh.id,rightCh);
                break;
            default:
                for (let i=0;i<this.chCount;i++) {
                    let ch = new AudioChannel({id:i+1});
                    this.channels.set(ch.id,ch);
                }
                break;
        }
    }

    update(data){
        this.chCount = isNaN(data.NCHN) ? data.NCHN : Number(data.NCHN);
        if (this.channels.size==0) this.initChannels();
    }

    toString(){
        return `${this.device.host}/${this.channel}`;
    }
}

module.exports = AudioStream;
