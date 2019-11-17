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
    console.log('src');
})
.on("destination",data=>{
    console.log('dst');
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
    console.log(data);
})

// TODO

.on("audio",data=>{
    console.log('audio');
})
.on("silence",data=>{
    console.log('silence');
});
