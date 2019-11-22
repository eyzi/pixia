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
            for (let src of data.sources) {
                this.addSource(src.data,src.label);
            }
        }

        if (data.destinations && data.destinations.length>0) {
            for (let dst of data.destinations) {
                this.addDestination(dst.data,dst.label);
            }
        }

        if (data.gpis && data.gpis.length>0) {
            for (let gpi of data.gpis) {
                this.addGpi(gpi.data,gpi.label);
            }
        }

        if (data.gpos && data.gpos.length>0) {
            for (let gpo of data.gpos) {
                this.addGpo(gpo.data,gpo.label);
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

        if (src.data instanceof Source) src.data.removeAllListeners();
        this.sources.delete(key);
        return true;
    }

    addDestination(dst,label=[]){
        let key = (dst instanceof Destination) ? dst.toString() : dst;
        this.destinations.set(key,new StationIO({
            label: label,
            data: dst
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

        if (dst.data instanceof Destination) dst.data.removeAllListeners();
        this.destinations.delete(key);
        return true;
    }


    addGpi(gpi,label=[]){
        let key = (gpi instanceof Gpi) ? gpi.toString() : gpi;
        this.gpis.set(key,new StationIO({
            label: label,
            data: gpi
        }));

        if (gpi instanceof Gpi) {
            gpi.on("change",GpioData=>{
                this.emit("gpi",GpioData);
            });
        }
    }

    removeGpi(resolveGpi){
        let key = (resolveGpi instanceof Gpi) ? resolveGpi.toString() : resolveGpi;
        let gpi = this.gpis.get(gpi);
        if (!gpi) return false;

        if (gpi.data instanceof Gpi) gpi.data.removeAllListeners();
        this.gpis.delete(key);
        return true;
    }


    addGpo(gpo,label=[]){
        let key = (gpo instanceof Gpo) ? gpo.toString() : gpo;
        this.gpos.set(key,new StationIO({
            label: label,
            data: gpo
        }));

        if (gpo instanceof Gpo) {
            gpo.on("change",GpioData=>{
                this.emit("gpi",GpioData);
            });
        }
    }

    removeGpo(resolveGpo){
        let key = (resolveGpo instanceof Gpo) ? resolveGpo.toString() : resolveGpo;
        let gpo = this.gpos.get(gpo);
        if (!gpo) return false;

        if (gpo.data instanceof Gpo) gpo.data.removeAllListeners();
        this.gpos.delete(key);
        return true;
    }

    updateDestinations(){
        this.destinations.forEach(d=>{
            if (typeof d.data=="string") {
                let o = this.manager.destinations.get(d.data);
                if (o) this.addDestination(o,d.label);
            }
        });
    }

    updateSources(){
        this.sources.forEach(d=>{
            if (typeof d.data=="string") {
                let o = this.manager.sources.get(d.data);
                if (o) this.addSource(o,d.label);
            }
        });
    }

    updateGpis(){
        this.gpis.forEach(d=>{
            if (typeof d.data=="string") {
                let o = this.manager.gpis.get(d.data);
                if (o) this.addGpi(o,d.label);
            }
        });
    }

    updateGpos(){
        this.gpos.forEach(d=>{
            if (typeof d.data=="string") {
                let o = this.manager.gpos.get(d.data);
                if (o) this.addGpo(o,d.label);
            }
        });
    }
}

module.exports = Station;
