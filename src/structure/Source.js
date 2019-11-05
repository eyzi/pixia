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
            chCount:data.NCHN
        });
    }

    update(data){
        this.raw = data;
        this.name = data.PSNM;
        this.address = data.RTPA;
    }
}

module.exports=Source;
