"use strict";

const Gpi = require("./Gpi");
const Gpo = require("./Gpo");
const Source = require("./Source");
const {EventEmitter} = require("events");
const Destination = require("./Destination");
const StationIO = require("./StationIO");

class Station extends EventEmitter{
    constructor(data){
        super();

        this.manager = data.manager;
        this.name = data.name || "Unnamed Station";

        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();

        // if (data.sources && data.sources.length>0) {
        //     for (let data of data.sources) {
        //         this.addSource(data.data,data.label);
        //     }
        // }
        //
        // if (data.destinations && data.destinations.length>0) {
        //     for (let data of data.destinations) {
        //         this.addDestination(data.data,data.label);
        //     }
        // }
        //
        // if (data.gpis && data.gpis.length>0) {
        //     for (let gpi of data.gpis) {
        //         this.addGpi(gpi);
        //     }
        // }
        //
        // if (data.gpos && data.gpos.length>0) {
        //     for (let gpo of data.gpos) {
        //         this.addGpo(gpo);
        //     }
        // }
    }

    addSource(src,label=[]){
        let key = (src instanceof Source) ? src.toString() : src;
        this.sources.set(key,new StationIO({
            label: label,
            data: src
        }));

        if (src instanceof Source) {
            src.on("change",_=>{
                this.emit("source",src);
            });
            src.on("subscribe",data=>{
                this.emit("subscribe",data);
            });
            src.on("unsubscribe",data=>{
                this.emit("unsubscribe",data);
            });
            src.on("meter",MeterData=>{
                this.emit("meter",{
                    stream: src,
                    meter: MeterData
                });
            });
        }
    }

    removeSource(resolveSrc){
        let key = (resolveSrc instanceof Source) ? resolveSrc.toString() : resolveSrc;
        let src = this.sources.get(key);
        if (!src) return false;

        if (src instanceof Source) src.removeAllListeners();
        this.sources.delete(key);
        return true;
    }



    addDestination(dst){
        let key = (dst instanceof Destination) ? dst.toString() : dst;
        this.destinations.set(key,new StationIO({
            label: label,
            data: src
        }));

        if (dst instanceof Destination) {
            dst.on("change",_=>{
                this.emit("destination",dst);
            });
            dst.on("meter",MeterData=>{
                this.emit("meter",{
                    stream: dst,
                    meter: MeterData
                });
            });
        }
    }

    removeDestination(resolveDst){
        let key = (resolveDst instanceof Destination) ? resolveDst.toString() : resolveDst;
        let dst = this.destinations.get(key);
        if (!dst) return false;

        if (dst instanceof Destination) dst.removeAllListeners();
        this.destinations.delete(key);
        return true;
    }


    addGpi(gpi){
        if (gpi instanceof Gpi) {
            gpi.on("change",GpioInfo=>{
                this.emit("gpi",GpioInfo);
            });
            this.gpis.set(gpi.toString(),new StationIO({
                label: 'gpi',
                data: gpi
            }));
        } else {
            this.gpis.set(gpi,gpi);
        }
    }

    removeGpi(resolveGpi){
        let gpi;

        if (resolveGpi instanceof Gpi) {
            gpi = this.gpis.get(resolveGpi.toString());
        } else if (typeof resolveGpi==='string') {
            gpi = this.gpis.get(resolveGpi);
        }

        if (!gpi) return false;

        gpi.removeAllListeners();
        this.gpis.delete(gpi.toString());
        return true;
    }


    addGpo(gpo){
        if (gpo instanceof Gpo) {
            gpo.on("change",GpioInfo=>{
                this.emit("gpo",GpioInfo);
            });
            this.gpos.set(gpo.toString(),new StationIO({
                label: 'gpo',
                data: gpo
            }));
        } else {
            this.gpos.set(gpo,gpo);
        }
    }

    removeGpo(resolveGpo){
        let gpo;

        if (resolveGpo instanceof Gpo) {
            gpo = this.gpos.get(resolveGpo.toString());
        } else if (typeof resolveGpo==='string') {
            gpo = this.gpos.get(resolveGpo);
        }

        if (!gpo) return false;

        gpo.removeAllListeners();
        this.gpos.delete(gpo.toString());
        return true;
    }
}

module.exports = Station;
