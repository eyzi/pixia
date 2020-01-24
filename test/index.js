"use strict";

const Pixia = require("..");
let manager = new Pixia();

[
  "172.16.16.114"
].forEach(address => {
  manager.addAddress(address);
})