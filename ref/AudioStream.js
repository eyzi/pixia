"use strict";

/**
 * Axia device audio channel for sources and destinations
 */
class AudioStream{
	constructor(data){
        this.raw = data.raw;
        this.device = data.device;
		this.channel = data.channel;
        this.numChannel = data.numChannel;

        this.stringType = data.stringType; // SRC or DST
        this.meterType = data.meterType; // ICH or OCH

        this.update(data);
	}

    update(data){
        this.name = data.name;
        this.silenceSense(data);
    }

    silenceSense(data){
        this.lowTime = data.lowTime || 3000;
        this.lowLevel = data.lowLevel || -1000;
        this.clipTime = data.clipTime || 3000;
        this.clipLevel = data.clipLevel || 0;
    }

	toString(){
		switch(this.stringType){
            case "SRC":
                return this.address;
                break;
            case "DST":
                if (this.device) {
                    return `${this.device.host}/${this.channel}`
                } else {
                    return this.name;
                }
                break;
            default:
                return this.name;
                break;
        }
	}
}

module.exports = AudioStream;
