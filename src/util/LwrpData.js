"use strict";

let delimit = function(string=""){
    if (string.trim()=="") return null;

    let dataArray	= [];
    let inQuotes	= false;
    let chunk		= "";

    //-----DELIMIT BY SPACES EXCEPT IN QUOTES
    let charCount=0;
    for (let char of string) {
        if (charCount==string.length-1) {
            chunk+=char;
            dataArray.push(chunk);
        } else if (char==" " && !inQuotes) {
            if (chunk!="") dataArray.push(chunk);
            chunk="";
            inQuotes=false;
        } else if (char==`"` && inQuotes) {
            chunk+=char;
            if (chunk!="") dataArray.push(chunk);
            chunk="";
            inQuotes=false;
        } else if (char==`"` && !inQuotes) {
            chunk+=char;
            inQuotes=true;
        } else {
            chunk+=char;
        }
        charCount++;
    }

    return dataArray;
}

let getVerb = function(string=""){
    if (data.trim()=="") return null;

    let dataArray = delimit(string);
    return dataArray.shift();
}

module.exports = {
    delimit,
    getVerb
}
