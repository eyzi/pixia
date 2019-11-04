"use strict";

const Pixia = require("..");

let manager = new Pixia();

let device = manager.addDevice({
    name: "XNode",
    host: "172.16.0.5"
});

device
.on("ready",_=>{
    console.log("test");
})
.on("data",data=>{
    console.log(data);
})
.on("error",error=>{
    console.log(error);
})
