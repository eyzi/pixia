"use strict";

const Pixia = require("..");
const Gpio = require("../src/structure/Gpio");
const Destination = require("../src/structure/Destination");

let manager = new Pixia();

manager.on("destinations",list=>{
    console.log(list.keys());
    // console.log('Destinations: ',list.values().map(e=>e.toString()));
});
manager.on("sources",list=>{
    console.log(list.keys());
    // console.log('Sources: ',list.values().map(e=>e.toString()));
});
manager.addAddress("172.16.0.11");
manager.addAddress("172.16.0.5");
