"use strict";

const {EventEmitter} = require("events");
const Lwrp = require("./Lwrp");
const Parser = require("../util/Parser");
const Source = require("./Source");
const Destination = require("./Destination");
const Gpi = require("./Gpi");
const Gpo = require("./Gpo");
const Error = require("./Error");

class Device extends EventEmitter{
    constructor(data){
        super();

        this.name = data.name || 'Axia Device';
        this.host = data.host;
        this.manager = data.manager;

        this.lwrp = new Lwrp(data);
        this.lwrp
            .on("connected",_=>this.handleConnection())
            .on("running",data=>this.handleRunning())
            .on("data",data=>this.handleData(data))
            .on("error",error=>this.handleError(error));

        this.destinations = new Map();
        this.sources = new Map();
        this.gpis = new Map();
        this.gpos = new Map();
    }

    async handleConnection(){
        this.login();
        this.getVersion();
    }

    async handleRunning(){
        this.emit("running");
    }

    async handleData(data){
        let parsed = Parser.Parse(data);
        switch (parsed.VERB) {
            case 'VER':
                await this.handleVersion(parsed);
                break;
            case 'SRC':
                await this.handleSource(parsed);
                break;
            case 'DST':
                await this.handleDestination(parsed);
                break;
            case 'MTR':
                await this.handleMeter(parsed);
                break;
        }
        this.emit("data",parsed);
    }

    async handleVersion(data){
        this.version = data.SVER;
        this.lwrpVersion = data.LWRP;
        this.devName = data.DEVN;
        this.srcCount = data.NSRC;
        this.dstCount = data.NDST;
        this.gpiCount = data.NGPI;
        this.gpoCount = data.NGPO;
        this.product = data.PRODUCT;
        this.model = data.MODEL;
        this.fpStat = data.FPSTAT;
        this.key = data.KEY;
        this.mixConfig = data.MIXCFG;
        this.mixCount = data.MIX;
        this.emit("ready");
    }

    async handleSource(data){
        let src = this.sources.get(data.CHANNEL);
        if(!src){
            src = new Source({
                device:this,
                manager:this.manager,
                ...data
            });
            this.sources.set(data.CHANNEL,src);
        }
        await src.update(data);
        this.emit('source',src);
    }

    async handleDestination(data){
        let dst = this.destinations.get(data.CHANNEL);
        if(!dst){
            dst = new Destination({
                device:this,
                manager:this.manager,
                ...data
            });
            this.destinations.set(data.CHANNEL,dst);
        }
        await dst.update(data);
        this.emit('destination',dst);
    }

    async handleGpi(data){
        let gpi = this.gpis.get(data.CHANNEL);
        if(!gpi){
            gpi = new Gpi({
                device:this,
                manager:this.manager,
                ...data
            });
        }
        await gpi.update(data);
        this.emit('gpi',gpi);
    }

    async handleGpo(data){
        let gpo = this.gpos.get(data.CHANNEL);
        if(!gpo){
            gpo = new Gpo({
                device:this,
                manager:this.manager,
                ...data
            });
        }
        await gpo.update(data);
        this.emit('gpo',gpo);
    }

    async handleMeter(data){
        let stream;
        switch(data.TYPE){
            case 'ICH':
                stream = this.sources.get(data.CHANNEL);
                break;
            case 'OCH':
                stream = this.destinations.get(data.CHANNEL);
                break;
        }
        if (!stream) return;

        stream.setMeter(data);
        this.emit('meter',stream.getMeter());
    }



    /* LWRP GETTERS */

    getSources(){
        if (this.srcCount && this.srcCount>0) {
            this.write(`SRC`);
        }
    }

    getDestinations(){
        if (this.dstCount && this.dstCount>0) {
            this.write(`DST`);
        }
    }

    getGpis(){
        if (this.gpiCount && this.gpiCount>0) {
            this.write(`ADD GPI`);
        }
    }

    getGpos(){
        if (this.gpoCount && this.gpoCount>0) {
            this.write(`ADD GPO`);
        }
    }

    getMeters(){
        this.lwrp.addCommand(`MTR`);
    }

    getVersion(password=this.pass){
        this.write(`VER`);
    }




    hasCommand(command){
        return this.lwrp.hasCommand(command);
    }

    async handleError(error){
        this.emit("error",new Error(error));
    }

    login(password=this.pass){
        this.write(`LOGIN ${password}`);
    }

    write(message){
        this.lwrp.write(message);
    }

    stop(){
        if (this.lwrp) {
            this.lwrp.stop();
            this.lwrp.socket = null;
        }
    }
}

module.exports=Device;
