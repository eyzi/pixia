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

        if (data.sources && data.sources.length>0) {
            for (let data of data.sources) {
                this.addSource(data.data,data.label);
            }
        }

        if (data.destinations && data.destinations.length>0) {
            for (let data of data.destinations) {
                this.addDestination(data.data,data.label);
            }
        }

        if (data.gpis && data.gpis.length>0) {
            for (let gpi of data.gpis) {
                this.addGpi(gpi);
            }
        }

        if (data.gpos && data.gpos.length>0) {
            for (let gpo of data.gpos) {
                this.addGpo(gpo);
            }
        }
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
        let src;

        if (resolveSrc instanceof Source) {
            src = this.sources.get(resolveSrc.toString());
        } else if (typeof resolveSrc==='string') {
            src = this.sources.get(resolveSrc);
        }

        if (!src) return false;

        src.removeAllListeners();
        this.sources.delete(src.toString());
        return true;
    }



    addDestination(dst){
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
            this.destinations.set(dst.toString(),new StationIO({
                label: 'destination',
                data: dst
            }));
        } else {
            this.destinations.set(dst,dst);
        }
    }

    removeDestination(resolveDst){
        let dst;

        if (resolveDst instanceof Destination) {
            dst = this.destinations.get(resolveDst.toString());
        } else if (typeof resolveDst==='string') {
            dst = this.destinations.get(resolveDst);
        }

        if (!dst) return false;

        dst.removeAllListeners();
        this.destinations.delete(dst.toString());
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
