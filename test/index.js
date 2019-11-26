"use strict";

const Pixia = require("..");
const Gpio = require("../src/structure/Gpio");
const Destination = require("../src/structure/Destination");

let manager = new Pixia();

manager.addAddress("172.16.0.5");
manager.addAddress("172.16.0.11");

let s1 = manager.addStation({
    name:"Test Station",
    sources:[
        {
            data: "172.16.0.5/1",
            label: ["live"]
        },
        {
            data: "172.16.0.5/2"
        },
        {
            data: "172.16.0.5/3"
        },
        {
            data: "172.16.0.5/4"
        }
    ],
    destinations:[
        {
            data: "172.16.0.5/1",
            label: ["live"]
        },
        {
            data: "172.16.0.5/2"
        },
        {
            data: "172.16.0.5/3"
        },
        {
            data: "172.16.0.5/4"
        }
    ],
    gpis:[
        {
            data: "172.16.0.11/1"
        }
    ],
    gpos:[
        {
            data: "172.16.0.11/1"
        }
    ]
});

setTimeout(_=>{
    let d = s1.dstByTag("live");
    d.data.setName("DST Test");
    d.data.setAddress("239.192.1.245");
},5000);

s1
.on("source",data=>{
    console.log('src',data.toString());
})
.on("destination",data=>{
    console.log('dst',data.toString());
})
.on("gpi",data=>{
    console.log('gpi',data.gpio.toString());
})
.on("gpo",data=>{
    console.log('gpo',data.gpio.toString());
})
.on("subscribe",data=>{
    console.log('subscribe',data.src.toString());
})
.on("unsubscribe",data=>{
    console.log('unsubscribe',data.src.toString());
})
.on("meter",data=>{
    //console.log(data);
})

// TODO
.on("audio",data=>{
    console.log('audio');
})
.on("silence",data=>{
    console.log('silence');
});
