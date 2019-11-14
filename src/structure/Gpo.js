"use strict";

const Gpio = require("./Gpio");

class Gpo extends Gpio{
    constructor(data){
        data.gpioType = "GPO";
        super(data);
    }

    update(data){
        super.update(data);
    }
}

module.exports = Gpo;
