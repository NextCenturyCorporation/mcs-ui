const scenesCollectionName = "mcsScenes.";
const sceneCollection = "mcs_scenes.";
const historyCollection = "mcs_history.";

const EQUALS = "equals";
const EQUALS_INPUT = "equalsInput";
const EQUALS_DROPDOWN = "equalsDropdown";
const CONTAINS = "contains";
const DOES_NOT_CONTAINS = "does_not_contain";
const BETWEEN = "between";
const AND = "and";
const OR = "or";
const GREATER_THAN = "greater_than";
const LESS_THAN = "less_than";

const checkifValueIsNumber = function(str) {
    if(isNaN(str)) {
        return str;
    } else {
        return +str;
    }
}

const createComplexMongoQuery = function(queryObj){
    let historyQueryObj = {};
    let sceneQueryObj = {};

    for(let i=0; i < queryObj.length; i++) {
        let searchPrefix = "";
        let evalName = "";

        if(queryObj[i]["fieldType"].indexOf(sceneCollection) > -1) {
            searchPrefix = scenesCollectionName;
            evalName = queryObj[i]["fieldType"].substring(sceneCollection.length);
            sceneQueryObj[searchPrefix + "eval"] = evalName;
        } else {
            evalName = queryObj[i]["fieldType"].substring(historyCollection.length);
            historyQueryObj[searchPrefix + "eval"] = evalName;
        }

        let regexObj, mQueryObj, obj1, obj2;

        switch(queryObj[i]["functionOperator"]) {
            case EQUALS:
            case EQUALS_DROPDOWN:
            case EQUALS_INPUT:
                let inObjList;
                if(isNaN(queryObj[i]["fieldValue1"])) {
                    inObjList = queryObj[i]["fieldValue1"].split("__,__");
                } else {
                    inObjList = [queryObj[i]["fieldValue1"]]
                }
                let extraChecks = [];
                for(let i = 0; i < inObjList.length; i++) {
                    if(isNaN(inObjList[i])){
                        if(inObjList[i].toLowerCase() === "true") {
                            inObjList[i] = true;
                        }
                        if(inObjList[i].toLowerCase() === "false") {
                            inObjList[i] = false;
                        }
                    } else {
                        if(parseFloat(inObjList[i]) !== NaN) {
                            extraChecks.push(parseFloat(inObjList[i]))
                        }
                    }
                }

                mQueryObj = {$in: inObjList.concat(extraChecks)};
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            case CONTAINS:
                regexObj = {$options: 'i', $regex: ".*" + queryObj[i]["fieldValue1"] + ".*"};
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = regexObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = regexObj;
                }
                break;
            case DOES_NOT_CONTAINS:
                regexObj = {$options: 'i', $regex: ".*" + queryObj[i]["fieldValue1"] + ".*"};
                mQueryObj = {$not: regexObj};
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            case BETWEEN:
                mQueryObj = {$gt: checkifValueIsNumber(queryObj[i]["fieldValue1"]), $lt: checkifValueIsNumber(queryObj[i]["fieldValue2"])};
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            case AND:
                obj1 = {}, obj2 = {};
                obj1[queryObj[i]["fieldName"]] = queryObj[i]["fieldValue1"];
                obj2[queryObj[i]["fieldName"]] = queryObj[i]["fieldValue2"];
                mQueryObj = [obj1, ob2]

                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[$and] = mQueryObj;
                } else {
                    historyQueryObj[$and] = mQueryObj;
                }
                break;
            case OR:
                mQueryObj = {$in: [queryObj[i]["fieldValue1"], queryObj[i]["fieldValue2"]]};
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            case GREATER_THAN:
                mQueryObj = {$gt: checkifValueIsNumber(queryObj[i]["fieldValue1"])}
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            case LESS_THAN:
                mQueryObj = {$lt: checkifValueIsNumber(queryObj[i]["fieldValue1"])}
                if(searchPrefix === scenesCollectionName) {
                    sceneQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                } else {
                    historyQueryObj[searchPrefix +  queryObj[i]["fieldName"]] = mQueryObj;
                }
                break;
            default:
                console.log("Error function operator not found.")
          }
    }
    
    let mongoQueryObj = {
        historyQuery: historyQueryObj,
        sceneQuery: sceneQueryObj
    };

    return mongoQueryObj;
}

module.exports = {
    createComplexMongoQuery
};