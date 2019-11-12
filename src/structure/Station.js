"use strict";

class Station{
    constructor(data){
        this.name = data.name || 'Unnamed Station';

        this.sources = new Map();
        this.destinations = new Map();
        this.gpis = new Map();
        this.gpos = new Map();
    }
}

module.exports=Station;
