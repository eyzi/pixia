"use strict";

const AudioStream = require("./AudioStream");
const Source = require("./Source");

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
    }

    subscribe(src){
        if (!(src instanceof Source)) return;
        if (this.source instanceof Source) {
            this.source.removeSub(this);
        }
        src.addSub(this);
    }

    async fixSource(){
        if (this.address) {
            let src = await this.manager.findSource(this.address)
            if (src) {
                this.subscribe(src);
            } else {
                this.source = this.address;
            }
        } else {
            this.source = null;
        }
    }

    async update(data){
        let ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i;
        let addrMatch = data.ADDR.match(ipRegex);
        this.raw = data;
        this.name = data.NAME;
        this.address = addrMatch ? addrMatch[0] : null;
        this.fixSource();
    }
}

module.exports=Destination;
