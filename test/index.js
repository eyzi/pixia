"use strict";

const Pixia = require("..");

let manager = new Pixia();

manager.on("log",message=>{
    console.log(message);
});

manager.on("ready.device",d=>{
    d.sources.forEach(s=>{
        console.log(s.subscribers);
    });
});

let device = manager.addDevice({
    name: "XNode",
    host: "172.16.0.5"
});
