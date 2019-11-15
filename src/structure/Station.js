"use strict";

const Gpi = require("./Gpi");
const Gpo = require("./Gpo");
const Source = require("./Source");
const {EventEmitter} = require("events");
const Destination = require("./Destination");

class Station extends EventEmitter{
    constructor(data){
        super();
        
        this.manager = data.manager;
        this.name = data.name || "Unnamed Station";

        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();
    }

    addSource(src){
        src.on("change",_=>{
            this.emit("source",src);
        });
        this.sources.set(src.toString(),src);
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
        dst.on("change",_=>{
            this.emit("destination",dst);
        });
        this.destinations.set(dst.toString(),dst);
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
        gpi.on("change",GpioInfo=>{
            this.emit("gpi",GpioInfo);
        });
        this.gpis.set(gpi.toString(),gpi);
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
        gpo.on("change",GpioInfo=>{
            this.emit("gpo",GpioInfo);
        });
        this.gpos.set(gpo.toString(),gpo);
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
