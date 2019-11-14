"use strict";

class AudioChannel{
    constructor(data){
        this.id = data.id;
        this.peek = -1000;
        this.rms = -1000;
    }
}

module.exports = AudioChannel;
