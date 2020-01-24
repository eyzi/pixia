"use strict";

const dgram = require("dgram");
const { Socket } = require("net");
const Device = require("./Device");
const { EventEmitter } = require("events");

class Manager extends EventEmitter {
  constructor (options = {}) {
    super();
    this.init(options);
  }

  init(options) {
    if (this.devices) this.devices.clear();

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

  validAddress(options = {}) {
    let host = options.host;
    let port = options.port || 93;
    let retries = options.retries || 3;
    let reconnectInterval = options.reconnectInterval || 3000;

    return new Promise((resolve, reject) => {
      if (!host) reject("Need host to check address");

      let socket = Socket();
      let tries = 0;

      socket.on("connect", _ => {
        resolve(true);
        socket.destroy();
      });

      socket.on("error", SocketError => {
        switch (SocketError.code) {
          case "ECONNREFUSED":
            resolve(false);
            socket.destroy();
            break;
          default:
            if (currentTries >= tries) {
              resolve(false);
              socket.destroy();
            } else {
              setTimeout(_ => {
                socket.connect(address, port);
              }, reconnectInterval);
            }
            break;
        }
      })

      socket.connect(address, port);
    });
  }

  addAddress(address) {
    if (!this.devices.has(address)) {
      this.devices.set(address, null);
      this.addDevice({ host: address });
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
  async addDevice(DeviceData) {
    let device = new Device(DeviceData);
    this.devices.set(device.host, device);

    device.on("connecting", _ => {
			this.emit("connecting");
    });

    device.on("run", _ => {
			this.emit("run");
    });

    device.on("pause", _ => {
			this.emit("pause");
    });

    device.on("stop", data => {
      // data potentially being stop code. do something with data
      this.devices.delete(device.host);
    });
  }
}

module.exports = Manager;