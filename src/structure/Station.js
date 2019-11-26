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

    addSource(src,label){
        let key = (src instanceof Source) ? src.toString() : src;
        this.sources.set(key,new StationIO({
            label: label || [],
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
        } else {
            // add host to manager address
            let address = src.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
            if (address) this.manager.addAddress(address[0]);
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

    addDestination(dst,label){
        let key = (dst instanceof Destination) ? dst.toString() : dst;
        this.destinations.set(key,new StationIO({
            label: label || [],
            data: dst
        }));

        console.log(dst);
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
        } else {
            // add host to manager address
            let address = dst.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
            if (address) this.manager.addAddress(address[0]);
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


    addGpi(gpi,label){
        let key = (gpi instanceof Gpi) ? gpi.toString() : gpi;
        this.gpis.set(key,new StationIO({
            label: label || [],
            data: gpi
        }));

        if (gpi instanceof Gpi) {
            gpi.on("change",GpioData=>{
                this.emit("gpi",GpioData);
            });
        } else {
            // add host to manager address
            let address = gpi.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
            if (address) this.manager.addAddress(address[0]);
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


    addGpo(gpo,label){
        let key = (gpo instanceof Gpo) ? gpo.toString() : gpo;
        this.gpos.set(key,new StationIO({
            label: label || [],
            data: gpo
        }));

        if (gpo instanceof Gpo) {
            gpo.on("change",GpioData=>{
                this.emit("gpi",GpioData);
            });
        } else {
            // add host to manager address
            let address = gpo.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
            if (address) this.manager.addAddress(address[0]);
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

    updateDestination(dst){
        let d = this.destinations.get(dst.toString());
        if (d) {
            this.destinations.set(dst.toString(),new StationIO({
                data: dst,
                label: d.label
            }));
        }
    }

    updateSource(src){
        let s = this.sources.get(src.toString());
        if (s) {
            this.sources.set(src.toString(),new StationIO({
                data: src,
                label: s.label
            }));
        }
    }

    updateGpi(gpi){
        let i = this.gpis.get(gpi.toString());
        if (i) {
            this.gpis.set(gpi.toString(),new StationIO({
                data: gpi,
                label: i.label
            }));
        }
    }

    updateGpo(gpo){
        let o = this.gpos.get(gpo.toString());
        if (o) {
            this.gpos.set(gpo.toString(),new StationIO({
                data: gpo,
                label: o.label
            }));
        }
    }

    srcByTag(tag) {
        for (let d in this.sources.values()) {
            if (d.hasTag(tag)) return d;
        }
        return null;
    }

    dstByTag(tag) {
        for (let d of this.destinations.values()) {
            if (d.hasTag(tag)) return d;
        }
        return null;
    }

    gpiByTag(tag) {
        for (let d in this.gpis.values()) {
            if (d.hasTag(tag)) return d;
        }
        return null;
    }

    gpoByTag(tag) {
        for (let d in this.gpos.values()) {
            if (d.hasTag(tag)) return d;
        }
        return null;
    }
}

module.exports = Station;
