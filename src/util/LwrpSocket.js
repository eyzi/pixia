"use strict";

const {Socket} = require("net");
const {EventEmitter} = require("events");
const PollCommand = require("../structure/PollCommand");

class LwrpSocket extends EventEmitter{
    constructor(LwrpData){
        super();

        this.host = LwrpData.host;
        this.name = LwrpData.name || "Axia Device";
        this.port = LwrpData.port || 93;
        this.pass = LwrpData.pass || "";
        this.reconnect = LwrpData.reconnect || 5000;
        this.pollInterval = LwrpData.pollInterval || 200;

        this.pollCommands = new Map();
        this.input = [];

        this.socket = Socket();
        this.socket
            .on("connect",_=>this.socketConnect())
            .on("data",data=>this.socketData(data))
            .on("error",error=>this.socketError(error));

        this.socket.connect(this.port,this.host);
    }

    run () {
        this.poller = setInterval(_=>{
            this.pollCommands.forEach(pc=>{
                this.write(pc.call());
                pc.checkValid();
            });
        },this.pollInterval);
        this.running=true;
        this.emit("running");
    }

    stop(){
        clearInterval(this.poller);
        this.running=false;
    }

    hasCommand(command){
        return this.pollCommands.has(command);
    }

    removeCommand(command){
        this.pollCommands.delete(command);
    }

    addCommand(command,count=null){
        let pc = new PollCommand({
            poller: this,
            command: command,
            count: count
        });
        this.pollCommands.set(pc.command,pc);
        return pc;
    }

    async socketConnect(){
        this.login();
        this.write("VER");
        this.emit("connected");
        this.run();
    }

    async socketData(data){
        let sData = data.toString();

        if (this.input.length>0) {
            let lastElement = this.input.pop();
            sData = lastElement+=sData;
        }

        sData.split(/\r?\n/).forEach(d=>{
            this.input.push(d);
        });

        while (this.input.length>1) {
            let chunk = this.input.shift();
            this.emit("data",this.parseData(chunk));
        }
    }

    async socketError(error){
        switch (error.code) {
            case "ECONNREFUSED":
                this.running = false;
                this.socket = null;
                this.emit("invalid");
                this.stop();
                break;
            default:
                this.running = false;
                this.emit("error",error);
                if (this.reconnect) {
                    setTimeout(_=>{
                        this.socket.connect(this.port,this.host);
                    },this.reconnect);
                }
                break;
        }
    }

    parseData(data){
        if (!data || data.trim()=="") return null;

        let parsed = { raw: data };

        let dataArray	= [];
        let inQuotes	= false;
        let chunk		= "";

        let charCount=0;
        for (let char of data) {
            if (charCount==data.length-1) {
                chunk+=char;
                dataArray.push(chunk);
            } else if (char==" " && !inQuotes) {
                if (chunk!="") dataArray.push(chunk);
                chunk="";
                inQuotes=false;
            } else if (char==`"` && inQuotes) {
                chunk+=char;
                if (chunk!="") dataArray.push(chunk);
                chunk="";
                inQuotes=false;
            } else if (char==`"` && !inQuotes) {
                chunk+=char;
                inQuotes=true;
            } else {
                chunk+=char;
            }
            charCount++;
        }

        parsed.array = [...dataArray];
        parsed.VERB = dataArray.shift();

        switch (parsed.VERB) {
            case "ERROR":
                parsed.CODE = dataArray.shift();
                parsed.MESSAGE = dataArray.join(" ");
                break;
        }

        switch (parsed.VERB) {
            case "MTR": case "LVL":
                parsed.TYPE = dataArray.shift();
                break;
        }

        switch (parsed.VERB) {
            case "LVL":
                let chMix = dataArray.shift().split(".");
                parsed.CHANNEL = chMix[0];
                parsed.SIDE = chMix[1];
                break;
            case "MTR":
            case "SRC": case "DST":
            case "GPI": case "GPO":
                parsed.CHANNEL = dataArray.shift();
                break;
        }

        switch (parsed.VERB) {
            case "LVL":
                parsed.FORM = dataArray.shift();
                break;
            case "GPI": case "GPO":
                parsed.VALUE = dataArray.shift();
                break;
        }

        for (let property of dataArray) {
            let p = property.match(/(.*?):(.*)/i);
            if (p) {
                parsed[p[1]] = p[2].replace(/"/g,"");
            }
        }

        return parsed;
    }

    login(password=null) {
        if (!password) password = this.pass;
        this.write(`LOGIN ${password}`);
    }

    write(message){
        if (this.socket) this.socket.write(`${message}\r\n`);
    }
}

module.exports = LwrpSocket;
