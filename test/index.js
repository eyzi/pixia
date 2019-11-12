"use strict";

const Pixia = require("..");

let manager = new Pixia();

let device = manager.addDevice({
    name: "XNode",
    host: "172.16.0.11"
});

let station = manager.addStation({
    name: "Station X"
});

manager
.on("destination",data=>{
    // console.log(data.sources);
})
.on("source",data=>{
    console.log(data);
})
.on("meter",data=>{
    // console.log(data);
})
.on("error",error=>{
    console.error(error);
});
