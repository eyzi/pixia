"use strict";

class Error{
    constructor(data){
        this.code = data.code;
        this.name = data.name;
        this.trace = data.trace;
    }
}

module.exports=Error;
