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
    switch(evalType) {
        case "intuitive physics":
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
            break;
        case "agents":
            chartOptions = [{label: "Total", value:"total"}, {label: "Total By Expected", value: "totalByExpected"}];
            if(hasNovelty) {
                chartOptions.push({label: "Total by Novelty", value: "totalByNovelty"});
            }
            for(let i=0; i < metadata.length; i++) {
                if(metadata[i] !== null) {
                    const prettyName = getMetaDataPrettyName(metadata[i]);
                    chartOptions.push({label: prettyName, value: metadata[i]});
                    chartOptions.push({label: prettyName + " by Expected", value: metadata[i] + "ByExpected"});
                    if(hasNovelty) {
                        chartOptions.push({label: prettyName + " by Novelty", value: metadata[i] + "ByNovelty"});
                    }
                }
            }
            break;
        case "retrieval":
        case "interactive":
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
            break;
        default:
            console.log("Invalid eval type submitted.")
    }

    return chartOptions;
}

function updateOverall(statsObj, scoreStatsObj, performer, weight) {
    if(statsObj.hasOwnProperty(performer)) {
        if(weight === 0) {
            console.log(statsObj[performer] + (scoreStatsObj["count"] * weight));
        }
        statsObj[performer] = statsObj[performer] + (scoreStatsObj["count"] * weight);
    } else {
        if(weight === 0) {
            console.log(scoreStatsObj["count"] * weight);
        }
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

function getChartData(isPlausibility, isPercent, scoreStats, isWeighted, evalType, isNovelty) {
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
                updateOverall(scoreOverallIncorrect, scoreStats[i], performer, weightedValue);
                if(scoreStats[i]["_id"]["plausibililty"] === 1 || scoreStats[i]["_id"]["hasNovelty"]) {
                    updateOverall(scorePlausibleIncorrect, scoreStats[i], performer, weightedValue);
                } else {
                    updateOverall(scoreImplausibleIncorrect, scoreStats[i], performer, weightedValue);
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
            const performer = scoreStats[i]["_id"]["performer"];
            const weightedValue = isWeighted ? scoreStats[i]["_id"]["weight"] : 1;
            const isCorrect = isWeighted ? scoreStats[i]["_id"]["weight_score"] > 0 : scoreStats[i]["_id"]["correct"];
            // Only Add Correct Items to Totals
            if(isCorrect) {
                // Update Overall/Total
                updateOverall(overallStats, scoreStats[i], performer, weightedValue);
                // Update Category/Plausibility
                updateCategory(categoryStats, scoreStats[i], performer, weightedValue);
            } else {
                // Update Overall/Total
                updateOverall(incorrectOverallStats, scoreStats[i], performer, weightedValue);
                // Update Category/Plausibility
                updateCategory(incorrectCategoryStats, scoreStats[i], performer, weightedValue);
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
        
        return {data: categoryStats, total: totalNum};
    }
}

module.exports = {
    getChartOptions,
    getChartData
};