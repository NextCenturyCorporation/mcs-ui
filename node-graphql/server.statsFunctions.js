function getMetaDataPrettyName(metadataName) {
    switch(metadataName) {
        case "oracle":
            return "Oracle";
        case "level2":
            return "Metadata 2";
        case "level1":
            return "Metadata 1";
        default:
            console.log("Metadata Level was not found.")
    }
}

function getChartOptions(evalType, metadata, hasNovelty) {
    let chartOptions = [];

    if(evalType === "intuitive physics") {
        chartOptions = [{label: "Total", value:"total"}, {label: "Total By Plausibility", value: "totalByPlausibility"}];
        if(hasNovelty) {
            chartOptions.push({label: "Total by Novelty", value: "totalByNovelty"});
        }
        for(let i=0; i < metadata.length; i++) {
            if(metadata[i] !== null) {
                const prettyName = getMetaDataPrettyName(metadata[i]);
                chartOptions.push({label: prettyName, value: metadata[i]});
                chartOptions.push({label: prettyName + " by Plausibility", value: metadata[i] + "ByPlausibility"});
                if(hasNovelty) {
                    chartOptions.push({label: prettyName + " by Novelty", value: metadata[i] + "ByNovelty"});
                }
            }
        }
    } else {
        chartOptions = [{label: "Total", value:"total"}];
        if(hasNovelty) {
            chartOptions.push({label: "Total by Novelty", value: "totalByNovelty"});
        }
        for(let i=0; i < metadata.length; i++) {
            if(metadata[i] !== null) {
                const prettyName = getMetaDataPrettyName(metadata[i]);
                chartOptions.push({label: prettyName, value: metadata[i]});
                if(hasNovelty) {
                    chartOptions.push({label: prettyName + " by Novelty", value: metadata[i] + "ByNovelty"});
                }
            }
        }
    }

    return chartOptions;
}

function updateOverall(statsObj, scoreStatsObj, performer, weight) {
    if(statsObj.hasOwnProperty(performer)) {
        statsObj[performer] = statsObj[performer] + (scoreStatsObj["count"] * weight);
    } else {
        statsObj[performer] = scoreStatsObj["count"] * weight;
    }
}

function updateCategory(categoryArray, scoreStatsObj, performer, weight) {
    const testType = scoreStatsObj["_id"]["category_type"];
        if(categoryArray.some(obj => obj.test_type === testType)) {
            const testObj = categoryArray.find( ({ test_type }) => test_type === testType );
            updateOverall(testObj, scoreStatsObj, performer, weight);
        } else {
            let newObj = {"test_type": testType};
            newObj[performer] = scoreStatsObj["count"] * weight;
            categoryArray.push(newObj)
        }
}

function calculatePercentage(baseStats, correspondingStats, isPlausible) {
    if(!isPlausible) {
        for(let i=0; i < baseStats.length; i++) {
            const matchingObj = correspondingStats.find(obj => {
                return obj.test_type === baseStats[i]["test_type"];
            });
            for(const key in baseStats[i]) {
                if(key !== "test_type") {
                    // Account for no incorrect answers
                    if(matchingObj === undefined ||  matchingObj[key] === undefined) {
                        baseStats[i][key] = 100;
                    }
                    // Account for division by 0
                    else if(baseStats[i][key] + matchingObj[key] === 0) {
                        baseStats[i][key] = 0;
                    } else {
                        baseStats[i][key] = Math.round(baseStats[i][key] / (baseStats[i][key] + matchingObj[key]) * 100);
                    }
                }
            }
        }

        return baseStats;
    } else {
        let newBaseStats = Object.assign({}, baseStats);
        for(const key in newBaseStats) {
            if(key !== "test_type") {
                if(newBaseStats[key] + correspondingStats[key] === 0) {
                    newBaseStats[key] = 0;
                } else {
                    newBaseStats[key] = Math.round(newBaseStats[key] / (newBaseStats[key] + correspondingStats[key]) * 100);
                }
            }
        }

        return newBaseStats;
    }
}

function getTotalNumberOfTests(correctData, incorrectData) {
    let totalNum = 0;
    for(const key in correctData) {
        if(key !== "test_type") {
            if(correctData[key] + incorrectData[key] > totalNum) {
                totalNum = correctData[key] + incorrectData[key];
            } 
        }
    }
    return totalNum;
}

function checkCorrespondingValuesObject(data1, data2) {
    for(const key in data1) {
        if(data2[key] === null || data2[key] === undefined) {
            data2[key] = 0;
        }
    }
}

// Will assign a value of zero to a matching array, if it's test type doesn't exist
function checkCorrespondingValuesArray(data1, data2) {
    for(let i=0; i < data1.length; i++) {
        const matchingElement = data2.find(element => element.test_type == data1[i].test_type);
        if(matchingElement === null || matchingElement === undefined) {
            let newObj = {};
            for(const key in data1[i]) {
                if(key === "test_type"){
                    newObj[key] = data1[i][key];
                } else {
                    newObj[key] = 0;
                }
            }
            data2.push(newObj)
        } else {
            checkCorrespondingValuesObject(data1[i], matchingElement);
        }
    }
}

function getChartData(isPlausibility, isPercent, scoreStats, isWeighted, evalType, isNovelty, useDidNotAnswer) {
    if(isPlausibility || isNovelty) {
        let plausibleTerm = evalType === 'agents' ? 'Expected' : 'Plausible';
        let implausibleTerm = evalType === 'agents' ? 'Unexpected' : 'Implausible';

        if(isNovelty) {
            plausibleTerm = "Novel";
            implausibleTerm = "No Novelty";
        }

        let scoreOverallCorrect = {"test_type": "Overall Correct"};
        let scoreOverallIncorrect = {"test_type": "Overall Incorrect"};
        let scorePlausibleCorrect = {"test_type": plausibleTerm + " Correct"};
        let scorePlausibleIncorrect = {"test_type": plausibleTerm + " Incorrect"};
        let scoreImplausibleCorrect = {"test_type": implausibleTerm + " Correct"};
        let scoreImplausibleIncorrect = {"test_type": implausibleTerm + " Incorrect"};

        for(let i = 0; i < scoreStats.length; i++) {
            const performer = scoreStats[i]["_id"]["performer"];
            const weightedValue = isWeighted ? scoreStats[i]["_id"]["weight"] : 1;
            const isCorrect = isWeighted ? scoreStats[i]["_id"]["weight_score"] > 0 : scoreStats[i]["_id"]["correct"];
            if(isCorrect) {
                updateOverall(scoreOverallCorrect, scoreStats[i], performer, weightedValue);
                if(scoreStats[i]["_id"]["plausibililty"] === 1 || scoreStats[i]["_id"]["hasNovelty"]) {
                    updateOverall(scorePlausibleCorrect, scoreStats[i], performer, weightedValue);
                } else {
                    updateOverall(scoreImplausibleCorrect, scoreStats[i], performer, weightedValue);
                }
            } else {
                if(useDidNotAnswer || (!useDidNotAnswer && scoreStats[i]["_id"]["description"] !== "No answer")) {
                    updateOverall(scoreOverallIncorrect, scoreStats[i], performer, weightedValue);
                    if(scoreStats[i]["_id"]["plausibililty"] === 1 || scoreStats[i]["_id"]["hasNovelty"]) {
                        updateOverall(scorePlausibleIncorrect, scoreStats[i], performer, weightedValue);
                    } else {
                        updateOverall(scoreImplausibleIncorrect, scoreStats[i], performer, weightedValue);
                    }
                }
            }
        }

        checkCorrespondingValuesObject(scoreOverallCorrect, scoreOverallIncorrect);
        checkCorrespondingValuesObject(scoreOverallIncorrect, scoreOverallCorrect);
        checkCorrespondingValuesObject(scorePlausibleCorrect, scorePlausibleIncorrect);
        checkCorrespondingValuesObject(scorePlausibleIncorrect, scorePlausibleCorrect);
        checkCorrespondingValuesObject(scoreImplausibleCorrect, scoreImplausibleIncorrect);
        checkCorrespondingValuesObject(scoreImplausibleIncorrect, scoreImplausibleCorrect);

        const totalNum = getTotalNumberOfTests(scoreOverallCorrect, scoreOverallIncorrect);

        if(isPercent) {
            let percentOverallCorrect = calculatePercentage(scoreOverallCorrect, scoreOverallIncorrect, true);
            let percentOverallIncorrect = calculatePercentage(scoreOverallIncorrect, scoreOverallCorrect, true);
            let percentPlausibleCorrect = calculatePercentage(scorePlausibleCorrect, scorePlausibleIncorrect, true);
            let percentPlausibleIncorrect = calculatePercentage(scorePlausibleIncorrect, scorePlausibleCorrect, true);
            let percentImplausibleCorrect = calculatePercentage(scoreImplausibleCorrect, scoreImplausibleIncorrect, true);
            let percentImplausibleIncorrect = calculatePercentage(scoreImplausibleIncorrect, scoreImplausibleCorrect, true);

            return {data: [percentOverallCorrect, percentOverallIncorrect, percentPlausibleCorrect,
                percentPlausibleIncorrect, percentImplausibleCorrect, percentImplausibleIncorrect].reverse(),
                total: totalNum};
        } else {
            return {data: [scoreOverallCorrect, scoreOverallIncorrect, scorePlausibleCorrect,
                scorePlausibleIncorrect, scoreImplausibleCorrect, scoreImplausibleIncorrect].reverse(),
                total: totalNum};
        }
    } else {
        let incorrectOverallStats = {"test_type": "Overall"};
        let overallStats = {"test_type": "Overall"};
        let categoryStats = [];
        let incorrectCategoryStats = [];

        for(let i = 0; i < scoreStats.length; i++) {
            // For passive agent tasks Eval 6+, we want to always weight (or pair) NYU agency
            // tasks, but want to be able to toggle weighting for other passive agency tasks
            // (like "seeing leads to knowing")
            let useWeighted = isWeighted
            if(scoreStats[i]["_id"]["category_type"].startsWith("agents")) {
                useWeighted = true
            }
            const performer = scoreStats[i]["_id"]["performer"];
            const weightedValue = useWeighted ? scoreStats[i]["_id"]["weight"] : 1;
            const isCorrect = useWeighted ? scoreStats[i]["_id"]["weight_score"] > 0 : scoreStats[i]["_id"]["correct"];
            // Only Add Correct Items to Totals
            if(isCorrect) {
                // Update Overall/Total
                updateOverall(overallStats, scoreStats[i], performer, weightedValue);
                // Update Category/Plausibility
                updateCategory(categoryStats, scoreStats[i], performer, weightedValue);
            } else {
                if(useDidNotAnswer || (!useDidNotAnswer && scoreStats[i]["_id"]["description"] !== "No answer")) {
                    // Update Overall/Total
                    updateOverall(incorrectOverallStats, scoreStats[i], performer, weightedValue);
                    // Update Category/Plausibility
                    updateCategory(incorrectCategoryStats, scoreStats[i], performer, weightedValue);
                }
            }
        }

        checkCorrespondingValuesArray(categoryStats, incorrectCategoryStats);
        checkCorrespondingValuesArray(incorrectCategoryStats, categoryStats);

        checkCorrespondingValuesObject(overallStats, incorrectOverallStats);
        checkCorrespondingValuesObject(incorrectOverallStats, overallStats);

        // Arrange Data in the Necessary Display Order
        categoryStats.sort((a, b) => (a.test_type < b.test_type) ? 1 : -1);
        categoryStats.push(overallStats);
        incorrectCategoryStats.push(incorrectOverallStats);

        const totalNum = getTotalNumberOfTests(overallStats, incorrectOverallStats);

        // Return Percent instead of Count when requested
        if(isPercent) {
            categoryStats = calculatePercentage(categoryStats, incorrectCategoryStats, false);
        }
        
        return {data: categoryStats, incorrectData: incorrectCategoryStats, total: totalNum};
    }
}

/****  Found this function at:  https://memory.psych.mun.ca/models/dprime/
 *      InvNormApprox:  Pass the hit rate and false alarm rate, and this
 *      	routine returns zHit and zFa.  d' = zHit - zFa.
 *          Converted from a basic routine provided by:
 *      Brophy, A. L. (1986).  Alternatives to a table of criterion 
 *              values in signal detection theory.  Behavior Research 
 *              Methods, Instruments, & Computers, 18, 285-286.
 ****/
function InvNormApprox( ina_p ) {

    var	ina_z;
    var	ina_r;
    var	ina_k;

    ina_k = -1;
    if ( ina_p > 0.5 ) {
        ina_p = 1 - ina_p;
        ina_k = 1;
    }

    if ( ina_p < .00001 ) {
        ina_z = 4.3;
        ina_z = ina_z * ina_k;
        return( ina_z );
    }

    ina_r = Math.sqrt(- (Math.log(ina_p)));
    ina_z = (((2.321213*ina_r+4.850141)*ina_r-2.297965)*ina_r-2.787189)/((1.637068*ina_r+3.543889)*ina_r+1);

    ina_z = ina_z * ina_k;
    return( ina_z );
}

function addPerformanceStats(statArray, includeDoNotAnswer) {
    for(let i=0; i < statArray.length; i++) {
        const totalCorrect = statArray[i]["correct_plausible"] + statArray[i]["correct_implausible"];
        let totalIncorrect = statArray[i]["incorrect_plausible"] + statArray[i]["incorrect_implausible"];

        let incorrectPlausible = statArray[i]["incorrect_plausible"];
        let incorrectImplausible = statArray[i]["incorrect_implausible"];

        if(includeDoNotAnswer) {
            totalIncorrect += statArray[i]["did_not_answer_plausible"] + statArray[i]["did_not_answer_implausible"];
            incorrectPlausible += statArray[i]["did_not_answer_plausible"];
            incorrectImplausible += statArray[i]["did_not_answer_implausible"];
        }

        statArray[i]["hitRate"] = (statArray[i]["correct_plausible"]/(statArray[i]["correct_plausible"] + incorrectPlausible)).toFixed(4);
        statArray[i]["falseAlarm"] = (incorrectImplausible/(statArray[i]["correct_implausible"] + incorrectImplausible)).toFixed(4);
        statArray[i]["total"] = totalCorrect + totalIncorrect;
        statArray[i]["mean"] = (totalCorrect/statArray[i]["total"]).toFixed(4);

        if(statArray[i]["hyperCubeID"] === "Totals") {
            let zTransformHitRate = 0;
            if(!isNaN(statArray[i]["hitRate"])) {
                zTransformHitRate = InvNormApprox(statArray[i]["hitRate"]);
            }
            let zTransformFalseAlarm = 0;
            if(!isNaN(statArray[i]["falseAlarm"])) {
                zTransformFalseAlarm = InvNormApprox(statArray[i]["falseAlarm"]);
            }
            statArray[i]["dPrime"] = zTransformHitRate - zTransformFalseAlarm;
        } else {
            statArray[i]["dPrime"] = "-";
        }

        let forStandardDeviation = 0;
        for(let x=0; x < totalCorrect; x++) {
            forStandardDeviation = forStandardDeviation + Math.pow((1 - statArray[i]["mean"]), 2);
        }

        for(let y=0; y < totalIncorrect; y++) {
            forStandardDeviation = forStandardDeviation + Math.pow((0 - statArray[i]["mean"]), 2);
        }

        statArray[i]["standardDeviation"] = (Math.sqrt(forStandardDeviation/statArray[i]["total"])).toFixed(4);

        statArray[i]["standardError"] = (statArray[i]["standardDeviation"] / Math.sqrt(statArray[i]["total"])).toFixed(4);

        if(statArray[i]["correct_plausible"] === 0 && statArray[i]["incorrect_plausible"] === 0 && statArray[i]["did_not_answer_plausible"] === 0) {
            statArray[i]["correct_plausible"] = "-";
            statArray[i]["incorrect_plausible"] = "-";
            statArray[i]["did_not_answer_plausible"] = "-";
            statArray[i]["hitRate"] = "-";
        }

        if(statArray[i]["correct_implausible"] === 0 && statArray[i]["incorrect_implausible"] === 0 && statArray[i]["did_not_answer_implausible"] === 0) {
            statArray[i]["correct_implausible"] = "-";
            statArray[i]["incorrect_implausible"] = "-";
            statArray[i]["did_not_answer_implausible"] = "-";
            statArray[i]["falseAlarm"] = "-";
        }
    }

    return statArray;
}

function updateStatObj(hyperCubeObj, statObj) {
    if(hyperCubeObj["_id"]["correct"] === 1) {
        if(hyperCubeObj["_id"]["groundTruth"] === 1) {
            statObj["correct_plausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
        } else if(hyperCubeObj["_id"]["groundTruth"] === 0) {
            statObj["correct_implausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
        }
    }
    else {
        if(hyperCubeObj["_id"]["description"] === "No answer") {
            if(hyperCubeObj["_id"]["groundTruth"] === 1) {
                statObj["did_not_answer_plausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
            } else if(hyperCubeObj["_id"]["groundTruth"] === 0) {
                statObj["did_not_answer_implausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
            }
        } else {
            if(hyperCubeObj["_id"]["groundTruth"] === 1) {
                statObj["incorrect_plausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
            } else if(hyperCubeObj["_id"]["groundTruth"] === 0) {
                statObj["incorrect_implausible"] += hyperCubeObj["count"] * hyperCubeObj["_id"]["scoreWorth"];
            }
        }
    }
}

function processStatNameField(statName, sliceLevel) {
    if(Array.isArray(statName)) {
        return statName[sliceLevel - 1];
    } else {
        return statName;
    }
}

function processStatNameKeywords(statName, sliceKeywords) {
    let sliceGroupings = [];
    for(let i=0; i < sliceKeywords.length; i++) {
        if(typeof sliceGroupings[sliceKeywords[i]["value"].split("_")[1]] === 'undefined') {
            sliceGroupings[sliceKeywords[i]["value"].split("_")[1]] = [sliceKeywords[i]["label"]];
        } else {
            sliceGroupings[sliceKeywords[i]["value"].split("_")[1]].push(sliceKeywords[i]["label"])
        }
    }

    // Remove empty elements in array that were there to help with organizing slices
    sliceGroupings = sliceGroupings.filter(function(e){return e}); 

    let groupingCombos = [];
    switch(sliceGroupings.length) {
        case 1:
            sliceGroupings[0].forEach(function(a1){
                groupingCombos.push([a1]);
            });
            break;
        case 2:
            sliceGroupings[0].forEach(function(a1){
                sliceGroupings[1].forEach(function(a2){
                    groupingCombos.push([a1, a2]);
                });
            });
            break;
        case 3:
            sliceGroupings[0].forEach(function(a1){
                sliceGroupings[1].forEach(function(a2){
                    sliceGroupings[2].forEach(function(a3){
                        groupingCombos.push([a1, a2, a3]);
                    });
                });
            });
            break;
        case 4:
            sliceGroupings[0].forEach(function(a1){
                sliceGroupings[1].forEach(function(a2){
                    sliceGroupings[2].forEach(function(a3){
                        sliceGroupings[3].forEach(function(a4){
                            groupingCombos.push([a1, a2, a3, a4]);
                        });
                    });
                });
            });
            break;
        default:
            break;
    }

    for(let j=0; j < groupingCombos.length; j++) {

        const containsAll = groupingCombos[j].every(element => statName.includes(element));

        if(containsAll && groupingCombos[j].length > 0) {
            let statStr = "";

            for(let i=0; i < groupingCombos[j].length; i++) {
                statStr += groupingCombos[j][i];

                if(i < groupingCombos[j].length - 1) {
                    statStr += ", ";
                }
            }

            return statStr;
        } 
    }

    return null;
}

function getEmptyStatsObject() {
    return {
        "correct_plausible": 0,
        "correct_implausible": 0,
        "incorrect_plausible": 0,
        "incorrect_implausible": 0,
        "did_not_answer_plausible": 0,
        "did_not_answer_implausible": 0
    };
}

function processHyperCubeStats(hyperCubeProjection, includeDoNotAnswer, statId, statName, sliceLevel, sliceType, sliceKeywords) {
    let statArray = [];
    let testType = hyperCubeProjection[0]["_id"]["testType"];

    for(let i = 0; i < hyperCubeProjection.length; i++) {
        let statObj;
        let newStatName;

        if(sliceType === "level" || sliceType === null) {
            newStatName = processStatNameField(hyperCubeProjection[i]["_id"][statId], sliceLevel);
            statObj = statArray.find(element => element[statName] === newStatName);
        } else {
            newStatName = processStatNameKeywords(hyperCubeProjection[i]["_id"][statId], sliceKeywords);

            if(newStatName === null) {
                continue;
            }
            statObj = statArray.find(element => element[statName] === newStatName);
        }

        if(statObj !== undefined) {
            updateStatObj(hyperCubeProjection[i], statObj);
        } else {
            let newStatObj = getEmptyStatsObject();
            newStatObj[statName] = newStatName;
            updateStatObj(hyperCubeProjection[i], newStatObj);
            statArray.push(newStatObj);
        }
    }

    statArray.sort((a, b) => (a[statName] > b[statName]) ? 1 : -1);
    // make sure if this is by slice level and slice ends in a number, we sort by that numerical value as well
    if(sliceType === "level") {
        statArray.sort((a, b) => /\d+$/.test(a.slice) - /\d+$/.test(b.slice) || a.slice.localeCompare(b.slice, undefined, { numeric: true }));
    }
    
    let totalStatObj = getEmptyStatsObject();
    totalStatObj[statName] = "Totals";

    let totalPlausibleStatObj = getEmptyStatsObject()
    totalPlausibleStatObj[statName] = "Totals Plausible";

    let totalImplausibleStatObj = getEmptyStatsObject()
    totalImplausibleStatObj[statName] = "Totals Implausible";

    for(let j = 0; j < statArray.length; j++) {
        totalStatObj["correct_plausible"] += statArray[j]["correct_plausible"];
        totalStatObj["correct_implausible"] += statArray[j]["correct_implausible"];
        totalStatObj["incorrect_plausible"] += statArray[j]["incorrect_plausible"];
        totalStatObj["incorrect_implausible"] += statArray[j]["incorrect_implausible"];
        totalStatObj["did_not_answer_plausible"] += statArray[j]["did_not_answer_plausible"];
        totalStatObj["did_not_answer_implausible"] += statArray[j]["did_not_answer_implausible"];

        if(testType === "intuitive physics" || testType === "passive") {
            totalPlausibleStatObj["correct_plausible"] += statArray[j]["correct_plausible"];
            totalPlausibleStatObj["incorrect_plausible"] += statArray[j]["incorrect_plausible"];
            totalPlausibleStatObj["did_not_answer_plausible"] += statArray[j]["did_not_answer_plausible"];
            totalImplausibleStatObj["correct_implausible"] += statArray[j]["correct_implausible"];
            totalImplausibleStatObj["incorrect_implausible"] += statArray[j]["incorrect_implausible"];
            totalImplausibleStatObj["did_not_answer_implausible"] += statArray[j]["did_not_answer_implausible"];
        }
    }

    statArray.push(totalStatObj);
    if(testType === "intuitive physics" || testType === "passive") {
        statArray.push(totalPlausibleStatObj);
        statArray.push(totalImplausibleStatObj);
    }

    return {
        "testType": testType,
        "stats": addPerformanceStats(statArray, includeDoNotAnswer)
    };
}

module.exports = {
    getChartOptions,
    getChartData,
    processHyperCubeStats
};