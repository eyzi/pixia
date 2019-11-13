"use strict";

const {EventEmitter} = require("events");
const LwrpSocket = require("../util/LwrpSocket");

class Device extends EventEmitter{
    constructor(DeviceData){
        if (!DeviceData.host) return null;

        super();

        this.manager = DeviceData.manager;
        this.host = DeviceData.host;
        this.name = DeviceData.name || "Axia Device";
        this.port = DeviceData.port || 93;
        this.pass = DeviceData.pass || "";

        this.srcCount = null;
        this.dstCount = null;
        this.gpiCount = null;
        this.gpoCount = null;

        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();

        this.initLwrp();
    }

    initLwrp(){
        this.lwrp = new LwrpSocket({
            host: this.host,
            name: this.name,
            port: this.port,
            pass: this.pass,
            reconnect: 5000,
            pollInterval: 200
        });

        this.lwrp
            .on("invalid",_=>{
                this.emit("invalid");
            })
            .on("data",data=>{
                this.handleData(data);
            })
            .on("error",error=>{
                console.error(error);
            });
    }

    initProperties(){
        if (this.srcCount>0) this.write("SRC");
        if (this.dstCount>0) this.write("DST");
        if (this.gpiCount>0) this.write("ADD GPI");
        if (this.gpoCount>0) this.write("ADD GPO");
    }

    async handleData(data){
        switch (data.VERB) {
            case "VER":
                this.version = data.LWRP;
                this.devName = data.DEVN;
                this.srcCount = isNaN(data.NSRC) ? data.NSRC : Number(data.NSRC);
                this.dstCount = isNaN(data.NDST) ? data.NDST : Number(data.NDST);
                this.gpiCount = isNaN(data.NGPI) ? data.NGPI : Number(data.NGPI);
                this.gpoCount = isNaN(data.NGPO) ? data.NGPO : Number(data.NGPO);
                this.emit("valid");
                break;
            case "ERROR":
                break;
            case "SRC":
                let src = this.sources.get(data.CHANNEL);
                if (!src) {
                    src = new Source({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                    src.on("change",_=>{
                        this.emit("source",src);
                    });
                }
                src.update(data);
                break;
            case "DST":
                let dst = this.destinations.get(data.CHANNEL);
                if (!dst) {
                    dst = new Destination({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                    dst.on("change",_=>{
                        this.emit("destination",dst);
                    });
                }
                dst.update(data);
                break;
            case "GPI":
                break;
        }
    }

    write(message){
        this.lwrp.write(message);
    }
}

module.exports = Device;
