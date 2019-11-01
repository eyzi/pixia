"use strict";

/**
 * Axia device source
 */
class Source{
	constructor(data){
        this.device = data.device;
		this.channel = data.channel;
        this.rtpa = data.rtpa;
		this.name = data.name;

        this.lowTime = null;
        this.lowLevel = null;
        this.clipTime = null;
        this.clipLevel = null;

        this.raw = null;
        this.subscribers = new Map();

        this.meter = {
            peek: {
                left: -1000,
                right: -1000
            },
            rms: {
                left: -1000,
                right: -1000
            }
        }

        this.setSilenceSense(data);
	}

    addSub(dst){
        let key = this.getDstKey(dst);
        this.subscribers.set(key,dst);
    }

    removeSub(dst){
        let key = this.getDstKey(dst);
        this.subscribers.delete(key);
    }

    setLevel(data){
        return;
    }

    setMeter(left=-1000,right=-1000,type="PEEK"){
        switch (type) {
            case "RMS":
                this.meter.rms.left = left;
                this.meter.rms.right = right;
                break;
            case "PEEK": default:
                this.meter.peek.left = left;
                this.meter.peek.right = right;
                break;
        }
    }

    setSilenceSense(data){
        this.clipLevel = data.clipLevel || 0;
        this.clipTime = data.clipTime || 3000;
        this.lowLevel = data.lowLevel || -1000;
        this.lowTime = data.lowTime || 3000;
        this.device.write(`LVL ICH ${ this.channel } LOW.LEVEL=${ this.lowLevel } LOW.TIME=${ this.lowTime } CLIP.LEVEL=${ this.clipLevel } CLIP.TIME=${ this.clipTime }`);
    }

    getDstKey(dst){
        return `${dst.device.host}/${dst.channel}`;
    }

	toString(){
		return this.channel;
	}
}

module.exports = Source;
