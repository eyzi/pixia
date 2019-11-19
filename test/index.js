"use strict";

const Pixia = require("..");
const Gpio = require("../src/structure/Gpio");

let manager = new Pixia();

manager.addAddress("172.16.0.5");
manager.addAddress("172.16.0.11");

let s1 = manager.addStation({
    name:"Test Station",
    sources:[
        {
            data: "172.16.0.5/1",
            labels: ["live"]
        },
        {
            data: "172.16.0.5/2",
            labels: []
        },
        {
            data: "172.16.0.5/3",
            labels: []
        },
        {
            data: "172.16.0.5/4",
            labels: []
        }
    ],
    destinations:[
        {
            data: "172.16.0.5/1",
            labels: ["live"]
        },
        {
            data: "172.16.0.5/2",
            labels: []
        },
        {
            data: "172.16.0.5/3",
            labels: []
        },
        {
            data: "172.16.0.5/4",
            labels: []
        }
    ],
    gpis:[
        {
            data: "172.16.0.11/1",
            labels: []
        }
    ],
    gpos:[
        {
            data: "172.16.0.11/1",
            labels: []
        }
    ]
});

manager.on("subscribe",_=>{
    console.log("src sub");
});

let a = "test";
let b = "test";

s1
.on("source",data=>{
    console.log('src');
})
.on("destination",data=>{
    console.log(data.toString());
})
.on("gpi",data=>{
    console.log('gpi');
})
.on("gpo",data=>{
    console.log('gpo');
})
.on("subscribe",data=>{
    console.log('subscribe');
})
.on("unsubscribe",data=>{
    console.log('unsubscribe');
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
