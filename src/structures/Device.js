"use strict";

const net = require("net");
const {EventEmitter} = require("events");
const Gpo = require("./Gpo");
const Gpi = require("./Gpi");
const Source = require("./Source");
const Destination = require("./Destination");

/**
 * An Axia device that uses lwrp
 */
class Device extends EventEmitter {
	constructor(data){
		super(); // Initialize EventEmitter

        // Properties
        this.manager = data.manager;
		this.name = data.name || "Axia Device";
		this.host = data.host || "127.0.0.1";
		this.port = data.port || 93;
		this.pass = data.pass || "";
		this.reconnect = data.reconnect || 5000;
		this.pollInterval = data.pollInterval || 200;


        // Instance state
        this.running = false;
        this.pollCommands = [];
        this.info = null;

        // Property maps
        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();

        // Telnet connection
		this.socket = net.Socket();
		this.socket
			.on("data",data=>this.socketData(data))
            .on("error",err=>this.error(err));

        this.initSocket();
	}



    async handleDST(data){
        let dst = this.destinations.get(data.CHANNEL);
        if (!dst) {
            dst = new Destination({
                device: this,
                channel: data.CHANNEL
            });
            this.destinations.set(data.CHANNEL,dst);
        }
        await dst.update(data);
        return;
    }

    async handleSRC(data){
        let src = this.sources.get(data.CHANNEL);
        if (!src) {
            src = new Source({
                device: this,
                channel: data.CHANNEL,
                rtpa: data.RTPA.IP,
                name: data.RTPA.NAME || `${this.name} Ch#${data.CHANNEL}`
            });
            this.sources.set(data.CHANNEL,src);
        }

        src.raw = data;
        if (data.RTPA) {
            src.rtpa = data.RTPA.IP;
            src.name = data.RTPA.NAME;
        }
    }

    async handleGPI(data){
        return;
    }

    async handleGPO(data){
        return;
    }

    async handleMTR(data){
        return;
    }

    async handleLVL(data){
        return;
    }



    getInfo() {
        this.write("VER");
    }

    getSources(){
        if (!this.info) return;
        if (this.info.NSRC && this.info.NSRC>0) {
            this.write("SRC");
        }
    }

    getDestinations(){
        if (!this.info) return;
        if (this.info.NDST && this.info.NDST>0) {
            this.write("DST");
        }
    }

    getGPOs(){
        if (!this.info) return;
        if (this.info.NGPO && this.info.NGPO>0)
            this.write("GPO");
    }

    getGPIs(){
        if (!this.info) return;
        if (this.info.NGPI && this.info.NGPI>0)
            this.write("GPI");
    }



    isReady(property=null){
        if (!this.info) return false;
        if (!property) {
            return (
                (!this.info.NSRC || this.info.NSRC==this.sources.size) &&
                (!this.info.NDST || this.info.NDST==this.destinations.size) &&
                (!this.info.NGPI || this.info.NGPI==this.gpis.size) &&
                (!this.info.NGPO || this.info.NGPO==this.gpos.size)
            );
        } else {
            switch(property){
                case 'sources':
                    return !this.info.NSRC || this.info.NSRC==this.sources.size;
                    break;
                case 'destinations':
                    return !this.info.NDST || this.info.NDST==this.destinations.size;
                    break;
                case 'gpis':
                    return !this.info.NGPI || this.info.NGPI==this.gpis.size;
                    break;
                case 'gpos':
                    return !this.info.NGPO || this.info.NGPO==this.gpos.size;
                    break;
            }
        }
    }

    run(){
        this.login(this.pass);
        this.write("VER");
        this.running = true;
    }

    initSocket(){
        if (this.port && this.host) {
            this.socket.connect(this.port,this.host,_=>{
    			this.emit("connected");
    		});
        }
    }

    async socketData(data){
        data.toString().split("\r\n").forEach(async chunk=>{
            let parsedData = await this.parseData(chunk);
            if (!parsedData) return;

            switch (parsedData.VERB) {
                case "VER":
                    this.info = parsedData;
                    this.emit("ready");
                    break;
                case "DST":
                    await this.handleDST(parsedData);
                    break;
                case "SRC":
                    await this.handleSRC(parsedData);
                    break;
                case "GPI":
                    await this.handleGPI(parsedData);
                    break;
                case "GPO":
                    await this.handleGPO(parsedData);
                    break;
                case "MTR":
                    await this.handleMTR(parsedData);
                    break;
                case "LVL":
                    await this.handleLVL(parsedData);
                    break;
            }

            this.emit("data",parsedData);
        });
    }

	async parseData(data) {
        if (data.trim()=="") return null;

    	let addrRegex	= new RegExp(/(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})(?:\s<(.*)>)?/);

    	let parsedData	= {};
    	let dataArray	= [];
    	let inQuotes	= false;
    	let chunk		= "";

    	//-----DELIMIT BY SPACES EXCEPT IN QUOTES
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

    	//-----PARSE DATA BY FIRST TERM
    	parsedData.HOST = this.host;
    	parsedData.VERB = dataArray.shift();
    	switch (parsedData.VERB) {
    		case "BEGIN":
    		case "END":
    			break;

    		case "ERROR":
    			parsedData.CODE 	= dataArray.shift();
    			parsedData.MESSAGE 	= dataArray.join(" ");
    			break;

    		case "LVL":
    			parsedData.TYPE 	= dataArray.shift();
    			let audioLevel		= dataArray.shift().split(".");
    			parsedData.CHANNEL 	= audioLevel[0];
    			parsedData.SIDE 	= audioLevel[1];
    			parsedData.FORM		= dataArray.shift();
    			break;

    		case "CFG":
    			parsedData.TYPE 	= dataArray.shift();
    			parsedData.CHANNEL 	= dataArray.shift();
    			parseProperties();
    			break;

    		case "GPO":
    		case "GPI":
    			parsedData.CHANNEL 	= dataArray.shift();
    			parsedData.STATE 	= dataArray.shift();
    			break;

    		case "IP":
    			if (dataArray[0]=="hostname") {
    				parsedData.HOSTNAME = dataArray[1];
    			}
    			else parseProperties();
    			break;

    		case "DST":
    		case "SRC":
    			parsedData.CHANNEL 	= dataArray.shift();
    			parseProperties();
    			break;

    		case "MTR":
    			parsedData.TYPE 	= dataArray.shift();
    			parsedData.CHANNEL 	= dataArray.shift();
    			parseProperties();
    			break;

    		default:
    			parseProperties();
    			break;
    	}

    	// general even layout
    	this.emit(`data.*`,parsedData);

    	// specific event layout
    	switch (parsedData.VERB) {
    		case "MTR": case "LVL":
    			this.emit(`data.${parsedData.VERB.toUpperCase()}`,parsedData);
    			this.emit(`data.${parsedData.VERB.toUpperCase()}.${parsedData.TYPE}`,parsedData);
    			break;
    		default:
    			this.emit(`data.${parsedData.VERB.toUpperCase()}`,parsedData);
    			break;
    	}

    	return parsedData;

    	function parseProperties() {
    		for (let property of dataArray) {
    			let propertyArray	= property.split(":");
    			let key				= propertyArray.shift();
    			let value			= propertyArray.join(":");
    			switch (key) {
    				case "SRCA":
    					let portData		= value.replace(/"/g,"").split("/");
    					parsedData[key]		= {};
    					parsedData[key].IP	= portData[0];
    					parsedData[key].PORT= portData[1];
    					break;

    				case "ADDR": case "RTPA":
    					if (value==`""`) {
    						parsedData[key]			= {};
    						parsedData[key].IP		= "";
    						parsedData[key].NAME	= "";
    					} else {
    						parsedData[key]			= {};
    						let addrData		= addrRegex.exec(value.replace(/"/g,""));
    						parsedData[key].IP	= addrData[1];
    						parsedData[key].NAME= addrData[2];
    					}
    					break;

    				case "PEEK": case "RMS":
    					let audioChannels	= /(-\d{1,4}):(-\d{1,4})/.exec(value);
    					parsedData[key]		= {
    						"LEFT"			: audioChannels[1],
    						"RIGHT"			: audioChannels[2]
    					};
    					break;
    				default:
    					parsedData[key]		= value.replace(/"/g,"");
    					break;
    			}
    		}
    	}
	}

	login(password){
		return this.write(`LOGIN ${password}`);
	}

	write(message){
		if (!this.socket) return this;
		this.socket.write(`${message}\r\n`);
		return this;
	}

    async error(data){
        this.running = false;
        this.emit("error",data);
        if (this.reconnect) {
            setTimeout(_=>{
                this.initSocket();
            },this.reconnect);
        }
    }

	toString(){
		return this.name;
	}
}

module.exports = Device;
