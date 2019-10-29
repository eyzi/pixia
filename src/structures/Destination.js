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

        this.raw = null;

        this.source = null;
		this.level = new Map();
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

	toString(){
		return this.channel;
	}
}

module.exports = Destination;
