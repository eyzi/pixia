"use strict";

const Gpio = require("./Gpio");

/**
 * Axia GPI channel
 */
class Gpi extends Gpio{
    constructor(data){
        super({
            ...data,
            type: "GPI"
        });
    }
}
