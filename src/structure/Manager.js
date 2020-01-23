"use strict";

const dgram = require("dgram");
const Device = require("./Device");
const {EventEmitter} = require("events");

class Manager extends EventEmitter {
  constructor (options = {}) {
    super();
    this.init(options);
  }

  init(options) {
    // option variables
    this.lwAdAutoadd = options.lwAdAutoadd || false;
    this.lwrpPort = options.lwrpPort || 93;
    this.lwAdPort = options.lwAdPort || 4001;
    this.lwAdMcast = options.lwAdMcast || "239.192.255.3";

    // instance variables
    this.devices = new Map();
  }

  initDiscovery() {
    this.socket = dgram.createSocket({
      type: "udp4",
      reuseAddr: true
    });

    this.socket
      .on("listening",_=>{
          this.emit("lwAdListening");
      })
      .on("message", (data,rinfo) => {
          if (this.lwAdAutoadd) this.addAddress(rinfo.address);
      })
      .on("error", err => {
          this.emit("lwAdError", err);
      });

    this.socket.bind(this.lwAdPort, _ => {
      this.socket.addMembership(this.lwAdMcast);
      this.emit("lwAdReady");
    });
  }

  addAddress(address) {
    if (!this.devices.has(address)) {
      this.devices.set(address, null);
      this.addDevice(address);
    }
  }

  removeAddress(address) {
    if (!this.devices.has(address)) {
      this.devices.delete(address);
    }
  }

  /**
   * DeviceData:
   *  host: address
   **/
  addDevice(DeviceData) {
    return new Promise((resolve, reject) => {
      let device = new Device(DeviceData);

      delete device;
    });
  }
}

module.exports = Manager;