"use strict";

const a1 = [
  "172.16.0.5",
  "172.16.0.11"
];
const a10 = [
  "172.16.16.101",
  "172.16.16.102",
  "172.16.16.103",
  "172.16.16.104",
  "172.16.16.106",
  "172.16.16.107",
  "172.16.16.108",
  "172.16.16.109",
  "172.16.16.110"
];
const a40 = [
  "172.16.16.101",
  "172.16.16.102",
  "172.16.16.103",
  "172.16.16.104",
  "172.16.16.106",
  "172.16.16.107",
  "172.16.16.108",
  "172.16.16.109",
  "172.16.16.110",
  "172.16.16.111",
  "172.16.16.112",
  "172.16.16.113",
  "172.16.16.114",
  "172.16.16.115",
  "172.16.16.116",
  "172.16.16.117",
  "172.16.16.118",
  "172.16.16.119",
  "172.16.16.120",
  "172.16.16.121",
  "172.16.16.122",
  "172.16.16.123",
  "172.16.16.124",
  "172.16.16.125",
  "172.16.16.126",
  "172.16.16.127",
  "172.16.16.128",
  "172.16.16.129",
  "172.16.16.130",
  "172.16.16.131",
  "172.16.16.132",
  "172.16.16.133",
  "172.16.16.134",
  "172.16.16.135",
  "172.16.16.136",
  "172.16.16.137",
  "172.16.16.138",
  "172.16.16.139",
];

const Pixia = require("..");
let manager = new Pixia();

setTimeout(_ => {
  let src = manager.sources.get("172.16.0.11/1");
  if (src) {
    src.setLevel({lowTime: 10000});
  }
}, 2000);

a1.forEach(address => {
  let d = manager.addAddress(address);
});