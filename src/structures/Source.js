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

        this.subscribers = new Map();
		this.levels = new Map();
	}

    addSub(dst){
        let key = this.getDstKey(dst);
        this.subscribers.set(key,dst);
    }

    removeSub(dst){
        let key = this.getDstKey(dst);
        this.subscribers.delete(key);
    }

    getDstKey(dst){
        return `${dst.device.host}/${dst.channel}`;
    }

	toString(){
		return this.channel;
	}
}

module.exports = Source;
