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
        this.streamType = data.streamType;

        this.channels = new Map(); // left and right
        this.lowLevel = -1000;
        this.lowTime = 3000;
        this.highLevel = 0;
        this.highTime = 3000;
        this.silenceSensor = false;

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

    getMeter(){
        return {
            left: this.channels.get('LEFT'),
            right: this.channels.get('RIGHT'),
        };
    }

    setMeter(data){
        if (data.PEEK) {
            for (let channel in data.PEEK) {
                let audioCh = this.channels.get(channel);
                if (audioCh) audioCh.peek = data.PEEK[channel];
            }
        }
        if (data.RMS) {
            for (let channel in data.RMS) {
                let audioCh = this.channels.get(channel);
                if (audioCh) audioCh.rms = data.RMS[channel];
            }
        }
    }

    silenceSense(data=null){
        if (data) {
            this.lowLevel = data.lowLevel;
            this.lowTime = data.lowTime;
            this.highLevel = data.highLevel;
            this.highTime = data.highTime;
        }

        let typeString = (this.streamType=="SRC") ? "ICH" : "OCH";
        this.device.write(`LVL ${typeString} ${this.channel} LOW.LEVEL=${this.lowLevel} LOW.TIME=${this.lowTime} CLIP.LEVEL=${this.clipLevel} CLIP.TIME=${this.clipTime}`);
        this.silenceSensor = true;
    }
}

module.exports=AudioStream;
