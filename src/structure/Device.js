"use strict";

const {EventEmitter} = require("events");
const Lwrp = require("./Lwrp");
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
        this.emit("ready");
    }

    async handleData(data){
        this.emit("data",data);
    }

    async handleError(error){
        this.emit("error",new Error(error));
    }

    getVersion(password=this.pass){
        this.lwrp.write(`VER`);
    }

    login(password=this.pass){
        this.lwrp.write(`LOGIN ${password}`);
    }

    write(message){
        this.lwrp.write(message);
    }
}

module.exports=Device;
