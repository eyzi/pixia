"use strict";

const {Socket} = require("net");
const {EventEmitter} = require("events");
const PollCommand = require("./PollCommand");

class Lwrp extends EventEmitter{
    constructor(data){
        super();

        this.host = data.host;
        this.port = data.port || 93;
        this.pass = data.pass || '';

        this.reconnect = data.reconnect || 5000;
        this.pollInterval = data.pollInterval || 200;

        this.running = false;
        this.pollCommands = new Map();
        this.poller = null;

        this.socket = Socket();
        this.socket
            .on("data",data=>this.socketData(data))
            .on("error",error=>this.socketError(error));

        this.initSocket();
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

    initSocket(){
        if (this.host) {
            this.socket.connect(this.port,this.host,_=>{
                this.run();
                this.emit("connected");
            });
        }
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

    write(message){
        if (this.running) {
            this.socket.write(`${message}\r\n`);
            return this;
        }
    }

    async socketData(data){
        data.toString().split("\r\n").forEach(async chunk=>{
            if (chunk) {
                this.emit("data",chunk);
            }
        });
    }

    async socketError(error){
        this.running = false;
        this.emit("error",error);
        if (this.reconnect) {
            setTimeout(_=>{
                this.initSocket();
            },this.reconnect);
        }
    }
}

module.exports=Lwrp;
