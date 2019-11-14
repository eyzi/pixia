"use strict";

const Pixia = require("..");

let manager = new Pixia();
manager.on("destinations",data=>{
    let d = manager.devices.get("172.16.0.11");
    //console.log(d);
});
