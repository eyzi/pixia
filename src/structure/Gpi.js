"use strict";

const AxiaGpio = require("./AxiaGpio");

class Gpi extends AxiaGpio {
	constructor(LwrpData) {
		LwrpData.type = "GPI";
		super(LwrpData);
	}
}

module.exports = Gpi;
