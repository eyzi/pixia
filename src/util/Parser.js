"use strict";

let ParseProperty = function(string=""){
    if (string.trim()=="") return null;
    let splitItem = string.split(":");
    if (splitItem) {
        let prop = {
            key: splitItem.shift(),
            value: splitItem.join(" ")
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

let ParseMeterData = function(string=""){
    if (string.trim()=="") return null;
    let splitItem = string.split(":");
    if (splitItem.length==3) {
        let prop = {
            key: splitItem.shift(),
            value: {
                LEFT: Number(splitItem.shift()),
                RIGHT: Number(splitItem.shift())
            }
        };
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

let ParseMeter = function(data){
    if (!data || data.trim()=="") return null;
    let array = DelimitSpace(data);
    let parsedData = {
        'VERB': array.shift(),
        'TYPE': array.shift(),
        'CHANNEL': array.shift()
    };
    for (let item of array) {
        let prop = ParseMeterData(item);
        parsedData[prop.key] = prop.value;
    }
    return parsedData;
}

let ParseLevel = function(data){
    if (!data || data.trim()=="") return null;
    let array = DelimitSpace(data);
    let parsedData = {
        'VERB': array.shift(),
        'TYPE': array.shift()
    };

    let chMix = array.shift().split('.');
    parsedData['CHANNEL'] = chMix[0];
    if (chMix[1]) parsedData['SIDE'] = chMix[1];

    parsedDatap['FORM'] = array.shift(); // LOW, NO-LOW, CLIP, or NO-CLIP

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
        case "MTR":
            return ParseMeter(data);
            break;
        case "LVL":
            return ParseLevel(data);
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
    ParseDestination,
    ParseMeter,
    ParseLevel
}
