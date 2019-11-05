"use strict";

let ParseProperty = function(string=""){
    if (string.trim()=="") return null;
    let splitItem = string.split(":");
    if (splitItem.length==2) {
        let prop = {
            key: splitItem[0],
            value: splitItem[1]
        };
        if (prop.value[0]==`"` && prop.value[prop.value.length-1]==`"`) {
            prop.value = prop.value.replace(/"/g,``);
        } else if (!isNaN(prop.value)) {
            prop.value = Number(prop.value);
        }
        return prop;
    } else {
        return {
            key: 'unknown',
            value: splitItem
        }
    }
}

let DelimitSpace = function(string=""){
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

    console.log(dataArray);

    return dataArray;
}

let Verb = function(data){
    if (!data || data.trim()=="") return null;
    return data.split(' ')[0];
}

let ParseSource = function(data){
    if (!data || data.trim()=="") return null;
    let array = DelimitSpace(data);
    let parsedData = {
        'VERB': array.shift(),
        'CHANNEL': array.shift()
    };
    for (let item of array) {
        let prop = ParseProperty(item);
        parsedData[prop.key] = prop.value;
    }
    return parsedData;
}

let ParseDestination = function(data){
    if (!data || data.trim()=="") return null;
    let array = DelimitSpace(data);
    let parsedData = {
        'VERB': array.shift(),
        'CHANNEL': array.shift()
    };
    for (let item of array) {
        let prop = ParseProperty(item);
        parsedData[prop.key] = prop.value;
    }
    return parsedData;
}

let ParseGeneric = function(data){
    if (!data || data.trim()=="") return null;
    let array = DelimitSpace(data);
    let parsedData = { 'VERB': array.shift() };
    for (let item of array) {
        let prop = ParseProperty(item);
        parsedData[prop.key] = prop.value;
    }
    return parsedData;
}

let Parse = function(data){
    if (!data || data.trim()=="") return null;
    //data=data.replace(`\r\n`,``);
    switch (Verb(data)) {
        case "SRC":
            return ParseSource(data);
            break;
        case "DST":
            return ParseDestination(data);
            break;
        case "VER":
        default:
            return ParseGeneric(data);
            break;
    }
    return array;
}

module.exports = {
    DelimitSpace,
    Verb,
    Parse,
    ParseSource,
    ParseDestination
}
