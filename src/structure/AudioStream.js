"use strict";

const AudioChannel = require("./AudioChannel");

class AudioStream{
    constructor(data){
        this.raw = data.raw;
        this.device = data.device;
        this.manager = data.manager;
        this.channel = data.channel;
        this.name = data.name;
        this.address = data.address;
        this.chCount = data.chCount;

        this.channels = new Map(); // left and right
        this.audioType = null;
        this.lowLevel = -1000;
        this.lowTime = 3000;
        this.highLevel = 0;
        this.highTime = 3000;

        this.initAudioChannels();
    }

    initAudioChannels () {
        switch (this.chCount) {
            case 1:
                this.channels.set('MONO',new AudioChannel({
                    id:'MONO'
                }));
                break;
            case 2:
                this.channels.set('LEFT',new AudioChannel({
                    id:'LEFT'
                }));
                this.channels.set('RIGHT',new AudioChannel({
                    id:'RIGHT'
                }));
                break;
        }
    }
}

module.exports=AudioStream;
