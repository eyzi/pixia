"use strict";

const AxiaGpio = require("./AxiaGpio");

class Gpi extends AxiaGpio {
	constructor(LwrpData) {
		LwrpData.gpioType = "GPI";
		super(LwrpData);
	}
}

module.exports = Gpi;
