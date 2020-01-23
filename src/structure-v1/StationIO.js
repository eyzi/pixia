"use strict";

class StationIO{
    constructor(StationIOData){
        this.label = StationIOData.label;
        this.data = StationIOData.data
    }

    hasTag(tag){
        return this.label.includes(tag);
    }
}

module.exports = StationIO;
