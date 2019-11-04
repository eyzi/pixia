"use strict";

const {EventEmitter} = require("events");
const Source = require("./Source");
const Destination = require("./Destination");
const Gpi = require("./Gpi");
const Gpo = require("./Gpo");

class Device extends EventEmitter{
    constructor(data){
        this.name = data.name;
        this.host = data.host;
        this.port = data.port;
        this.pass = data.pass;
        this.manager = data.manager;

        this.destinations = new Map();
        this.sources = new Map();
        this.gpis = new Map();
        this.gpos = new Map();
    }
}
