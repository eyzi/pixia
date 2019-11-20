"use strict";

class AudioChannel{
    constructor(data){
        this.id = data.id;
        this.peek = -1000;
        this.rms = -1000;
    }

    fromJson(data){
        this.id = data.id;
        this.peek = data.peek;
        this.rms = data.rms;
    }

    toJson(){
        let json = {
            id: this.id,
            peek: this.peek,
            rms: this.rms
        };
        return json;
    }
}

module.exports = AudioChannel;
