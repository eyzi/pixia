"use strict";

const Pixia = require("..");
const Gpio = require("../src/structure/Gpio");
const Destination = require("../src/structure/Destination");

let manager = new Pixia();

manager.on("level",data=>{
    console.log(data);
});

manager.addAddress("172.16.0.11");
manager.addAddress("172.16.0.5");
