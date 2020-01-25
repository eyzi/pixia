"use strict";

const AxiaGpio = require("./AxiaGpio");

class Gpo extends AxiaGpio {
	constructor(LwrpData) {
		LwrpData.gpioType = "GPO";
		super(LwrpData);
	}
}

module.exports = Gpo;
