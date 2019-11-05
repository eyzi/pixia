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
        }
        //this.emit("data",parsed);
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
                manager:this.manager
            });
        }
        src.update(data);
        this.emit('source',src);
    }

    async handleDestination(data){
        let dst = this.destinations.get(data.CHANNEL);
        if(!dst){
            dst = new Destination({
                device:this,
                manager:this.manager
            });
        }
        dst.update(data);
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

    getGpis(password=this.pass){
        if (this.gpiCount && this.gpiCount>0) {
            this.write(`ADD GPI`);
        }
    }

    getGpos(password=this.pass){
        if (this.gpoCount && this.gpoCount>0) {
            this.write(`ADD GPO`);
        }
    }

    getVersion(password=this.pass){
        this.write(`VER`);
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
}

module.exports=Device;
