"use strict";

const Gpio = require("./Gpio");

/**
 * Axia GPO channel
 */
class Gpo extends Gpio{
    constructor(data){
        super({
            ...data,
            type: "GPO"
        });
    }
}

module.exports=Gpo;
