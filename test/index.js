"use strict";

const Pixia = require("..");

let manager = new Pixia();
manager.addAddress("172.16.0.5");
manager.addAddress("172.16.0.11");
let s1 = manager.addStation({
    name:"Test Station",
    sources:[
        "172.16.0.5/1",
        "172.16.0.5/2",
        "172.16.0.5/3",
        "172.16.0.5/4"
    ],
    destinations:[
        "172.16.0.5/1",
        "172.16.0.5/2",
        "172.16.0.5/3",
        "172.16.0.5/4"
    ],
    gpis:[
        "172.16.0.11/1"
    ],
    gpos:[
        "172.16.0.11/1"
    ]
});

console.log(s1);

s1
.on("source",data=>{
    //console.log('on src event');
})
.on("destination",data=>{
    console.log('on dst event');
})
.on("gpi",data=>{
    //console.log('on gpi event',data.gpio.toString());
})
.on("gpo",data=>{
    //console.log('on gpo event',data.gpio.toString());
});
