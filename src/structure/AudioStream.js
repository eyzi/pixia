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
        this.name = data.name;
        this.address = data.address || null;

        this.lowStatus = false;
        this.clipStatus = false;
        
        this.initialized = false;
        this.channels = new Map();
        this.setLevel({});
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

    async update(data){
        this.chCount = isNaN(data.NCHN) ? data.NCHN : Number(data.NCHN);
        if (this.channels.size==0) this.initChannels();
        if (!this.initialized) this.initialized = true;
    }

    setMeter(data){
        if (!data.PEEK) return;

        let sides = data.PEEK.split(":");
        switch(sides.length){
            case 2:
                let leftCh = this.channels.get('left');
                if (!leftCh) return;
                leftCh.peek = Number(sides[0]);

                let rightCh = this.channels.get('right');
                if (!rightCh) return;
                rightCh.peek = Number(sides[0]);

                this.emit("meter",{
                    left: leftCh.peek,
                    right: rightCh.peek
                });
                break;
            default:
                break;
        }
    }

    setLevelInfo (form, side) {
        let prevLow = this.lowStatus
        let prevClip = this.clipStatus
        switch (form.toUpperCase()) {
            case 'LOW':
                this.lowStatus = true
                if (this.lowStatus !== prevLow) {
                    this.emit("change", this)
                }
                break;
            case 'NO-LOW':
                this.lowStatus = false
                if (this.lowStatus !== prevLow) {
                    this.emit("change", this)
                }
                break;
            case 'CLIP':
                this.clipStatus = true
                if (this.clipStatus !== prevClip) {
                    this.emit("change", this)
                }
                break;
            case 'NO-CLIP':
                this.clipStatus = false
                if (this.clipStatus !== prevClip) {
                    this.emit("change", this)
                }
                break;
        }
    }

    setLevel({lowTime,lowLevel,clipTime,clipLevel}){
        let type;
        switch(this.streamType){
            case "SRC":
                type="ICH";
                break;
            case "DST":
                type="OCH";
                break;
        }

        if (type){
            this.device.write(`LVL ${type} ${this.channel} LOW.TIME:"${lowTime || 3000}" LOW.LEVEL:"${lowLevel || -1000}" CLIP.TIME:"${clipTime || 3000}" CLIP.LEVEL:"${clipLevel || 0}"`);
        }
    }

    toJson(){
        let json = {
            channel: this.channel,
            name: this.name,
            channels: {}
        };

        this.channels.forEach(ch=>{
            json.channels[ch.id] = ch.toJson();
        });

        return json;
    }

    toString(){
        return `${this.device.host}/${this.channel}`;
    }
}

module.exports = AudioStream;
