"use strict";

const Gpi = require("./Gpi");
const Gpo = require("./Gpo");
const Source = require("./Source");
const {EventEmitter} = require("events");
const Destination = require("./Destination");
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
        this.lwrp.addCommand("MTR");
    }

    createSource(AudioStreamData){
        let src = new Source(AudioStreamData);
        src.on("change",_=>{
            this.emit("source",src);
        });
        src.on("subscribe",data=>{
            this.emit("subscribe",data);
        });
        src.on("unsubscribe",data=>{
            this.emit("unsubscribe",data);
        });
        this.sources.set(src.toString(),src);
        return src;
    }

    createDestination(AudioStreamData){
        let dst = new Destination(AudioStreamData);
        dst.on("change",_=>{
            this.emit("destination",dst);
        });
        this.destinations.set(dst.toString(),dst);
        return dst;
    }

    createGpi(GpioData){
        let gpi = new Gpi(GpioData);
        gpi.on("change",GpioInfo=>{
            this.emit("gpi",GpioInfo);
        });
        this.gpis.set(gpi.toString(),gpi);
        return gpi;
    }

    createGpo(GpioData){
        let gpo = new Gpo(GpioData);
        gpo.on("change",GpioInfo=>{
            this.emit("gpo",GpioInfo);
        });
        this.gpos.set(gpo.toString(),gpo);
        return gpo;
    }

    async handleData(data={}){
        if (!data) return;

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
                let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
                if (!src) {
                    src = this.createSource({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                }
                src.update(data);
                break;
            case "DST":
                let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
                if (!dst) {
                    dst = this.createDestination({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                }
                dst.update(data);
                break;
            case "GPI":
                let gpi = this.gpis.get(`${this.host}/${data.CHANNEL}`);
                if (!gpi) {
                    gpi = this.createGpi({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                }
                gpi.update(data);
                break;
            case "GPO":
                let gpo = this.gpos.get(`${this.host}/${data.CHANNEL}`);
                if (!gpo) {
                    gpo = this.createGpo({
                        manager: this.manager,
                        device: this,
                        channel: data.CHANNEL
                    });
                }
                gpo.update(data);
                break;
            case "MTR":
                if (data.TYPE==="ICH") {
                    let src = this.sources.get(`${this.host}/${data.CHANNEL}`);
                    if (src) src.setMeter(data);
                } else if (data.TYPE==="OCH") {
                    let dst = this.destinations.get(`${this.host}/${data.CHANNEL}`);
                    if (dst) dst.setMeter(data);
                }
                break;
        }
    }

    write(message){
        this.lwrp.write(message);
    }
}

module.exports = Device;
