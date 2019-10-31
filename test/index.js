"use strict";

const Pixia = require("..");

let manager = new Pixia();

manager.on("log",message=>{
    console.log(message);
});

manager.on("data.level",d=>{
    console.log(d);
});

let device = manager.addDevice({
    name: "XNode",
    host: "172.16.0.5"
});
