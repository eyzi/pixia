"use strict";

const dgram = require("dgram");
const {EventEmitter} = require("events");

class LwrpDiscovery extends EventEmitter{
    constructor(autoadd=true){
        super();

        this.autoadd = autoadd;
        this.port = 4001;
        this.mcast = "239.192.255.3";

        this.addresses = [];
        this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });

        this.socket
            .on("listening",_=>{
                this.emit("listening");
            })
            .on("message",(data,rinfo)=>{
                if (this.autoadd) this.addAddress(rinfo.address);
            })
            .on("error",err=>{
                this.emit("error",err);
            });

        this.socket.bind(this.port,_=>{
            this.socket.addMembership(this.mcast);
            this.emit("ready");
        });
    }

    addAddress(address){
        if (!address || this.addresses.includes(address)) {
            return false;
        } else {
            this.addresses.push(address);
            this.emit("address",address);
            return true;
        }
    }

    removeAddress(address){
        this.addresses = this.addresses.filter(a=>a!==address);
    }
}

module.exports = LwrpDiscovery;
