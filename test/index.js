"use strict";

const Pixia = require("..");

let manager = new Pixia();

manager.addDevice({
    name: "XNode",
    host: "172.16.0.5"
});

manager.on("lwrp.data",data=>{
    console.log(data);
});
