"use strict";

const AudioStream = require("./AudioStream");

class Destination extends AudioStream{
    constructor(data){
        super(data);
    }
}

module.exports=Destination;
