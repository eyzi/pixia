"use strict";

const Gpio = require("./Gpio");

class Gpi extends Gpio{
    constructor(data){
        data.gpioType = "GPI";
        super(data);
    }

    update(data){
        super.update(data);
    }
}

module.exports = Gpi;
