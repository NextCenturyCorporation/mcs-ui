const updateScoreObject = function(scoreObject, scoreTotalObject, statObj) {
    const performer = statObj._id.performer;
    if(scoreTotalObject[performer] !== undefined) {
        scoreTotalObject[performer] = scoreTotalObject[performer] + statObj.count;
    } else {
        scoreTotalObject[performer] = statObj.count;
    }

    if(scoreObject[performer] !== undefined) {
        scoreObject[performer] = scoreObject[performer] + statObj.count;
    } else {
        scoreObject[performer] = statObj.count;
    }
}

const statsByScore = function(scoreStats){
    scoreStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

    let scoreOverallCorrect = {"score_type": "Overall Correct"};
    let scoreOverallIncorrect = {"score_type": "Overall Incorrect"};
    let scorePlausibleCorrect = {"score_type": "Plausible Correct"};
    let scorePlausibleIncorrect = {"score_type": "Plausible Incorrect"};
    let scoreImplausibleCorrect = {"score_type": "Implausible Correct"};
    let scoreImplausibleIncorrect = {"score_type": "Implausible Incorrect"};

    for(let i=0; i < scoreStats.length; i++) {
        if(scoreStats[i]._id.plausibililty === 0 && scoreStats[i]._id.category === "observation") {
            if(scoreStats[i]._id.correct === 1) {
                updateScoreObject(scoreImplausibleCorrect, scoreOverallCorrect, scoreStats[i]);
            } else {
                updateScoreObject(scoreImplausibleIncorrect, scoreOverallIncorrect, scoreStats[i]);
            }
        } else if(scoreStats[i]._id.plausibililty === 1  && scoreStats[i]._id.category === "observation") {
            if(scoreStats[i]._id.correct === 1) {
                updateScoreObject(scorePlausibleCorrect, scoreOverallCorrect, scoreStats[i]);
            } else {
                updateScoreObject(scorePlausibleIncorrect, scoreOverallIncorrect, scoreStats[i]);
            }
        }
    }

    return [scoreOverallCorrect, scoreOverallIncorrect, scorePlausibleCorrect,
        scorePlausibleIncorrect, scoreImplausibleCorrect, scoreImplausibleIncorrect].reverse();
}

const updateTestTypeScoreObj = function(testTypeArray, statObj) {
    const performer = statObj._id.performer;
    let testObj = testTypeArray.find(x => x.test_type === statObj._id.category_type);
    if(testObj === undefined ) {
        let newObj = {"test_type": statObj._id.category_type};
        newObj[performer] = statObj.count;
        testTypeArray.push(newObj);
    } else {
        if(testObj[performer] !== undefined) {
            testObj[performer] = testObj[performer] + statObj.count;
        } else {
            testObj[performer] = statObj.count;
        }
    }
}

const updateTestTypeTotalsObj = function (overallObj, statObj) {
    const performer = statObj._id.performer;

    if(overallObj[performer] !== undefined) {
        overallObj[performer] = overallObj[performer] + statObj.count;
    } else {
        overallObj[performer] = statObj.count;
    }
}

const sortScoreArray = function(scoreArray) {
    scoreArray.sort((a, b) => (a.test_type > b.test_type) ? 1 : -1);

    return scoreArray;
}

const statsByTestType = function(testTypeStats){
    testTypeStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

    let passiveScoresCorrect = [];
    let interactiveScoresCorrect = [];
    let passiveScoresTotal= [];
    let interactiveScoresTotal = [];

    let interactiveOverallCorrect = {"test_type": "Overall"};
    let passiveOverallCorrect = {"test_type": "Overall"};
    let interactiveOverallTotal = {"test_type": "Overall"};
    let passiveOverallTotal = {"test_type": "Overall"};

    for(let i=0; i < testTypeStats.length; i++) {
        const performer = testTypeStats[i]._id.performer;
        if(testTypeStats[i]._id.category === "interactive") {
            if(testTypeStats[i]._id.correct === 1) {
                updateTestTypeScoreObj(interactiveScoresCorrect, testTypeStats[i]);
                updateTestTypeTotalsObj(interactiveOverallCorrect, testTypeStats[i]);
            } 
            updateTestTypeScoreObj(interactiveScoresTotal, testTypeStats[i]);
            updateTestTypeTotalsObj(interactiveOverallTotal, testTypeStats[i]);
        } else {
            if(testTypeStats[i]._id.correct === 1) {
                updateTestTypeScoreObj(passiveScoresCorrect, testTypeStats[i]);
                updateTestTypeTotalsObj(passiveOverallCorrect, testTypeStats[i]);
            } 
            updateTestTypeScoreObj(passiveScoresTotal, testTypeStats[i]);
            updateTestTypeTotalsObj(passiveOverallTotal, testTypeStats[i]);
        }
    }

    const typeStatsObj = {
        passiveCorrect: [passiveOverallCorrect].concat(sortScoreArray(passiveScoresCorrect)).reverse(),
        passiveTotal: [passiveOverallTotal].concat(sortScoreArray(passiveScoresTotal)).reverse(),
        interactiveCorrect: [interactiveOverallCorrect].concat(sortScoreArray(interactiveScoresCorrect)).reverse(),
        interactiveTotal: [interactiveOverallTotal].concat(sortScoreArray(interactiveScoresTotal)).reverse()
    }

    return typeStatsObj;
}

module.exports = {
    statsByScore,
    statsByTestType
};