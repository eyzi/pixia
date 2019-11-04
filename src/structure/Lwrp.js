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

    initSocket(){
        if (this.host) {
            this.socket.connect(this.port,this.host,_=>{
                this.emit("connected");
            });
        }
    }

    removeCommand(command){
        this.pollCommands.delete(command);
    }

    addCommand(data){
        if (!data.command) return;
        let pollCommand = new PollCommand({
            ...data,
            poller: this
        })
        this.pollCommands.set(data.command,pollCommand);
        return pollCommand;
    }

    write(message){
        if (this.running) {
            this.socket.write(`${message}\r\n`);
            return this;
        }
    }

    async socketData(data){
        this.emit("data",data);
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
