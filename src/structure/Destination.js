"use strict";

const AudioStream = require("./AudioStream");

class Destination extends AudioStream{
    constructor(data){
        super({
            raw:data,
            device:data.device,
            manager:data.manager,
            channel:data.CHANNEL,
            name:data.NAME,
            address:data.ADDR,
            chCount:data.NCHN,
            streamType:'DST'
        });
        console.log(this);
        this.source = null;
    }

    async update(data){
        let ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i;
        let addrMatch = data.ADDR.match(ipRegex);
        this.raw = data;
        this.name = data.NAME;
        this.address = addrMatch
            ? await this.manager.findSource(addrMatch[0])
            : data.ADDR;
    }
}

module.exports=Destination;
