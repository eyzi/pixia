"use strict";

const AudioStream = require("./AudioStream");

class Source extends AudioStream{
    constructor(data){
        super(data);
    }
}

module.exports=Source;
