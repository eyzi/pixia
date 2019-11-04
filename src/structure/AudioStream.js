"use strict";

class AudioStream{
    constructor(data){
        this.channel = data.channel;
        this.name = data.name;
        this.channels = new Map(); // left and right

        // nchn num of channels
    }
}

module.exports=AudioStream;
