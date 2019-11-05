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
            chCount:data.NCHN
        });
    }

    update(data){
        this.raw = data;
        this.name = data.NAME;
        this.address = data.ADDR;
    }
}

module.exports=Destination;
