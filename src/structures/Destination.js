"use strict";

/**
 * Axia device destination
 */
class Destination{
	constructor(data){
        this.device = data.device;
		this.channel = data.channel;
		this.addr = data.addr;
        this.name = data.name;

        this.lowTime = null;
        this.lowLevel = null;
        this.clipTime = null;
        this.clipLevel = null;

        this.raw = null;
        this.source = null;

        this.meter = {
            peek: {
                left: {
                    value: -1000,
                    low: true
                },
                right: {
                    value: -1000,
                    low: true
                }
            },
            rms: {
                left: -1000,
                right: -1000
            }
        }

        this.setSilenceSense(data);
	}

    // take DST data and handle
    async update(data){
        if (this.source) {
            this.source.removeSub(this);
        }

        this.raw = data.raw;
        if (data.ADDR) {
            this.addr = data.ADDR.IP;
            this.name = data.ADDR.NAME;
        }

        if (this.device.manager && this.addr) {
            let src = await this.device.manager.getSource(this.addr);
            if (src) {
                this.source = src;
                this.source.addSub(this);
            } else {
                this.source = src.RTPA.IP;
            }
        }
    }

    setLevel(data){

        switch (data.SIDE) {
            case "L":

                break;
            case "R":

                break;
        }
        return;
    }

    setMeter(data){
        if (data.PEEK) {
            this.meter.peek.value.left = data.PEEK.LEFT;
            this.meter.peek.value.right = data.PEEK.RIGHT;
        }
        if (data.RMS) {
            this.meter.rms.left = data.RMS.LEFT;
            this.meter.rms.right = data.RMS.RIGHT;
        }
    }

    setSilenceSense(data){
        this.clipLevel = data.clipLevel || 0;
        this.clipTime = data.clipTime || 3000;
        this.lowLevel = data.lowLevel || -1000;
        this.lowTime = data.lowTime || 3000;
        this.device.write(`LVL OCH ${ this.channel } LOW.LEVEL=${ this.lowLevel } LOW.TIME=${ this.lowTime } CLIP.LEVEL=${ this.clipLevel } CLIP.TIME=${ this.clipTime }`);
    }

	toString(){
		return this.channel;
	}
}

module.exports = Destination;
