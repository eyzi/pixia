"use strict";

const AxiaGpio = require("./AxiaGpio");

class Gpo extends AxiaGpio {
	constructor(LwrpData) {
		LwrpData.type = "GPO";
		super(LwrpData);
	}
}

module.exports = Gpo;
