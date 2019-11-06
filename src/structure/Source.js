"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream{
    constructor(data){
        super({
            raw:data,
            device:data.device,
            manager:data.manager,
            channel:data.CHANNEL,
            name:data.PSNM,
            address:data.RTPA,
            chCount:data.NCHN,
            streamType:'SRC'
        });

        this.subscribers = new Map();
    }

    removeSub(dst){
        let dstKey = `${dst.device.host}/${dst.channel}`;
        this.subscribers.delete(dstKey);
        dst.source = null;
    }

    addSub(dst){
        dst.source.removeSub(dst);
        let dstKey = `${dst.device.host}/${dst.channel}`;
        this.subscribers.set(dstKey,dst);
        dst.source = this;
    }

    async update(data){
        this.raw = data;
        this.name = data.PSNM;
        this.address = data.RTPA;
    }
}

module.exports=Source;
