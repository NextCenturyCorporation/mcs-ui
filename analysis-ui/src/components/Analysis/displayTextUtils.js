function convertArrayToString(arrayToConvert) {
    let newStr = "";
    for(let i=0; i < arrayToConvert.length; i++) {
        newStr = newStr + convertValueToString(arrayToConvert[i]);

        if(i < arrayToConvert.length -1) {
            newStr = newStr + ", ";
        }
    }

    return newStr;
}

function convertObjectToString(objectToConvert) {
    let newStr = "";
    Object.keys(objectToConvert).forEach((key, index) => {
        newStr = newStr + key + ": " + convertValueToString(objectToConvert[key]);

        if(index < Object.keys(objectToConvert).length - 1) {
            newStr = newStr + ", ";
        }
    })

    return newStr;
}

export function convertValueToString(valueToConvert) {
    if(Array.isArray(valueToConvert) && valueToConvert !== null) {
        return convertArrayToString(valueToConvert);
    }

    if(typeof valueToConvert === 'object' && valueToConvert !== null) {
        return convertObjectToString(valueToConvert);
    }

    if(valueToConvert === true) {
        return "true";
    } 

    if(valueToConvert === false) {
        return "false";
    } 

    if(!isNaN(valueToConvert)) {
        return Math.floor(valueToConvert * 100) / 100;
    }

    return valueToConvert;
}