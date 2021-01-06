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

const calculatePercentObjectByScore = function(scoreObj, forTotalObj, percentObject) {
    for( const prop in scoreObj) {
        if(prop !== "test_type") {
            const calculatedPercent = scoreObj[prop] / (scoreObj[prop] + forTotalObj[prop]) * 100;
            percentObject[prop] = Math.round(calculatedPercent);
        }
    }
}

const statsByScore = function(scoreStats){
    scoreStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

    let scoreOverallCorrect = {"test_type": "Overall Correct"};
    let scoreOverallIncorrect = {"test_type": "Overall Incorrect"};
    let scorePlausibleCorrect = {"test_type": "Plausible Correct"};
    let scorePlausibleIncorrect = {"test_type": "Plausible Incorrect"};
    let scoreImplausibleCorrect = {"test_type": "Implausible Correct"};
    let scoreImplausibleIncorrect = {"test_type": "Implausible Incorrect"};
    let scoreOverallCorrectMetadata1 = {"test_type": "Overall Correct"};
    let scoreOverallIncorrectMetadata1 = {"test_type": "Overall Incorrect"};
    let scorePlausibleCorrectMetadata1 = {"test_type": "Plausible Correct"};
    let scorePlausibleIncorrectMetadata1 = {"test_type": "Plausible Incorrect"};
    let scoreImplausibleCorrectMetadata1 = {"test_type": "Implausible Correct"};
    let scoreImplausibleIncorrectMetadata1 = {"test_type": "Implausible Incorrect"};
    let scoreOverallCorrectMetadata2 = {"test_type": "Overall Correct"};
    let scoreOverallIncorrectMetadata2 = {"test_type": "Overall Incorrect"};
    let scorePlausibleCorrectMetadata2 = {"test_type": "Plausible Correct"};
    let scorePlausibleIncorrectMetadata2 = {"test_type": "Plausible Incorrect"};
    let scoreImplausibleCorrectMetadata2 = {"test_type": "Implausible Correct"};
    let scoreImplausibleIncorrectMetadata2 = {"test_type": "Implausible Incorrect"};

    let agentScoreOverallCorrect = {"test_type": "Overall Correct"};
    let agentScoreOverallIncorrect = {"test_type": "Overall Incorrect"};
    let agentScorePlausibleCorrect = {"test_type": "Expected Correct"};
    let agentScorePlausibleIncorrect = {"test_type": "Expected Incorrect"};
    let agentScoreImplausibleCorrect = {"test_type": "Unexpected Correct"};
    let agentScoreImplausibleIncorrect = {"test_type": "Unexpected Incorrect"};
    let agentScoreOverallCorrectMetadata1 = {"test_type": "Overall Correct"};
    let agentScoreOverallIncorrectMetadata1 = {"test_type": "Overall Incorrect"};
    let agentScorePlausibleCorrectMetadata1 = {"test_type": "Expected Correct"};
    let agentScorePlausibleIncorrectMetadata1 = {"test_type": "Expected Incorrect"};
    let agentScoreImplausibleCorrectMetadata1 = {"test_type": "Unexpected Correct"};
    let agentScoreImplausibleIncorrectMetadata1 = {"test_type": "Unexpected Incorrect"};
    let agentScoreOverallCorrectMetadata2 = {"test_type": "Overall Correct"};
    let agentScoreOverallIncorrectMetadata2 = {"test_type": "Overall Incorrect"};
    let agentScorePlausibleCorrectMetadata2 = {"test_type": "Expected Correct"};
    let agentScorePlausibleIncorrectMetadata2 = {"test_type": "Expected Incorrect"};
    let agentScoreImplausibleCorrectMetadata2 = {"test_type": "Unexpected Correct"};
    let agentScoreImplausibleIncorrectMetadata2 = {"test_type": "Unexpected Incorrect"};


    console.log(scoreStats);

    for(let i=0; i < scoreStats.length; i++) {
        if(scoreStats[i]._id.plausibililty === 0 && (scoreStats[i]._id.category === "observation" || scoreStats[i]._id.category === "passive")) {
            if(scoreStats[i]._id.correct === 1) {
                if(scoreStats[i]._id.test_type === "agents"){
                    updateScoreObject(agentScoreImplausibleCorrect, agentScoreOverallCorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(agentScoreImplausibleCorrectMetadata1, agentScoreOverallCorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(agentScoreImplausibleCorrectMetadata2, agentScoreOverallCorrectMetadata2, scoreStats[i]);
                    }
                } else {
                    updateScoreObject(scoreImplausibleCorrect, scoreOverallCorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(scoreImplausibleCorrectMetadata1, scoreOverallCorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(scoreImplausibleCorrectMetadata2, scoreOverallCorrectMetadata2, scoreStats[i]);
                    }
                }
            } else {
                if(scoreStats[i]._id.test_type === "agents"){
                    updateScoreObject(agentScoreImplausibleIncorrect, agentScoreOverallIncorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(agentScoreImplausibleIncorrectMetadata1, agentScoreOverallIncorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(agentScoreImplausibleIncorrectMetadata2, agentScoreOverallIncorrectMetadata2, scoreStats[i]);
                    }
                } else {
                    updateScoreObject(scoreImplausibleIncorrect, scoreOverallIncorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(scoreImplausibleIncorrectMetadata1, scoreOverallIncorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(scoreImplausibleIncorrectMetadata2, scoreOverallIncorrectMetadata2, scoreStats[i]);
                    }
                }
            }
        } else if(scoreStats[i]._id.plausibililty === 1  && (scoreStats[i]._id.category === "observation" || scoreStats[i]._id.category === "passive")) {
            if(scoreStats[i]._id.correct === 1) {
                if(scoreStats[i]._id.test_type === "agents"){
                    updateScoreObject(agentScorePlausibleCorrect, agentScoreOverallCorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(agentScorePlausibleCorrectMetadata1, agentScoreOverallCorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(agentScorePlausibleCorrectMetadata2, agentScoreOverallCorrectMetadata2, scoreStats[i]);
                    }
                } else {
                    updateScoreObject(scorePlausibleCorrect, scoreOverallCorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(scorePlausibleCorrectMetadata1, scoreOverallCorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(scorePlausibleCorrectMetadata2, scoreOverallCorrectMetadata2, scoreStats[i]);
                    }
                }
            } else {
                if(scoreStats[i]._id.test_type === "agents"){
                    updateScoreObject(agentScorePlausibleIncorrect, agentScoreOverallIncorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(agentScorePlausibleIncorrectMetadata1,  agentScoreOverallIncorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(agentScorePlausibleIncorrectMetadata2,  agentScoreOverallIncorrectMetadata2, scoreStats[i]);
                    }
                } else {
                    updateScoreObject(scorePlausibleIncorrect, scoreOverallIncorrect, scoreStats[i]);
                    if(scoreStats[i]._id.metadata === "level1") {
                        updateScoreObject(scorePlausibleIncorrectMetadata1,  scoreOverallIncorrectMetadata1, scoreStats[i]);
                    }
                    if(scoreStats[i]._id.metadata === "level2") {
                        updateScoreObject(scorePlausibleIncorrectMetadata2,  scoreOverallIncorrectMetadata2, scoreStats[i]);
                    }
                }
            }
        }
    }

    let statsByScoreObject = {};
    statsByScoreObject["plausibleTotal"] = [scoreOverallCorrect, scoreOverallIncorrect, scorePlausibleCorrect,
        scorePlausibleIncorrect, scoreImplausibleCorrect, scoreImplausibleIncorrect].reverse();
    statsByScoreObject["plausibleMetadata1"] = [scoreOverallCorrectMetadata1, scoreOverallIncorrectMetadata1, scorePlausibleCorrectMetadata1,
        scorePlausibleIncorrectMetadata1, scoreImplausibleCorrectMetadata1, scoreImplausibleIncorrectMetadata1].reverse();
    statsByScoreObject["plausibleMetadata2"] = [scoreOverallCorrectMetadata2, scoreOverallIncorrectMetadata2, scorePlausibleCorrectMetadata2,
        scorePlausibleIncorrectMetadata2, scoreImplausibleCorrectMetadata2, scoreImplausibleIncorrectMetadata2].reverse();

    statsByScoreObject["expectedTotal"] = [agentScoreOverallCorrect, agentScoreOverallIncorrect, agentScorePlausibleCorrect,
        agentScorePlausibleIncorrect, agentScoreImplausibleCorrect, agentScoreImplausibleIncorrect].reverse();
    statsByScoreObject["expectedMetadata1"] = [agentScoreOverallCorrectMetadata1, agentScoreOverallIncorrectMetadata1, agentScorePlausibleCorrectMetadata1,
        agentScorePlausibleIncorrectMetadata1, agentScoreImplausibleCorrectMetadata1, agentScoreImplausibleIncorrectMetadata1].reverse();
    statsByScoreObject["expectedMetadata2"] = [scoreOverallCorrectMetadata2, scoreOverallIncorrectMetadata2, scorePlausibleCorrectMetadata2,
        agentScorePlausibleIncorrectMetadata2, agentScoreImplausibleCorrectMetadata2, agentScoreImplausibleIncorrectMetadata2].reverse();

    let percentScoreOverallCorrect = {"test_type": "Overall Correct"};
    let percentScoreOverallIncorrect = {"test_type": "Overall Incorrect"};
    let percentScorePlausibleCorrect = {"test_type": "Plausible Correct"};
    let percentScorePlausibleIncorrect = {"test_type": "Plausible Incorrect"};
    let percentScoreImplausibleCorrect = {"test_type": "Implausible Correct"};
    let percentScoreImplausibleIncorrect = {"test_type": "Implausible Incorrect"};
    let percentScoreOverallCorrectMetadata1 = {"test_type": "Overall Correct"};
    let percentScoreOverallIncorrectMetadata1 = {"test_type": "Overall Incorrect"};
    let percentScorePlausibleCorrectMetadata1 = {"test_type": "Plausible Correct"};
    let percentScorePlausibleIncorrectMetadata1 = {"test_type": "Plausible Incorrect"};
    let percentScoreImplausibleCorrectMetadata1 = {"test_type": "Implausible Correct"};
    let percentScoreImplausibleIncorrectMetadata1 = {"test_type": "Implausible Incorrect"};
    let percentScoreOverallCorrectMetadata2 = {"test_type": "Overall Correct"};
    let percentScoreOverallIncorrectMetadata2 = {"test_type": "Overall Incorrect"};
    let percentScorePlausibleCorrectMetadata2 = {"test_type": "Plausible Correct"};
    let percentScorePlausibleIncorrectMetadata2 = {"test_type": "Plausible Incorrect"};
    let percentScoreImplausibleCorrectMetadata2 = {"test_type": "Implausible Correct"};
    let percentScoreImplausibleIncorrectMetadata2 = {"test_type": "Implausible Incorrect"};

    let agentPercentScoreOverallCorrect = {"test_type": "Overall Correct"};
    let agentPercentScoreOverallIncorrect = {"test_type": "Overall Incorrect"};
    let agentPercentScorePlausibleCorrect = {"test_type": "Expected Correct"};
    let agentPercentScorePlausibleIncorrect = {"test_type": "Expected Incorrect"};
    let agentPercentScoreImplausibleCorrect = {"test_type": "Unexpected Correct"};
    let agentPercentScoreImplausibleIncorrect = {"test_type": "Unexpected Incorrect"};
    let agentPercentScoreOverallCorrectMetadata1 = {"test_type": "Overall Correct"};
    let agentPercentScoreOverallIncorrectMetadata1 = {"test_type": "Overall Incorrect"};
    let agentPercentScorePlausibleCorrectMetadata1 = {"test_type": "Expected Correct"};
    let agentPercentScorePlausibleIncorrectMetadata1 = {"test_type": "Expected Incorrect"};
    let agentPercentScoreImplausibleCorrectMetadata1 = {"test_type": "Unexpected Correct"};
    let agentPercentScoreImplausibleIncorrectMetadata1 = {"test_type": "Unexpected Incorrect"};
    let agentPercentScoreOverallCorrectMetadata2 = {"test_type": "Overall Correct"};
    let agentPercentScoreOverallIncorrectMetadata2 = {"test_type": "Overall Incorrect"};
    let agentPercentScorePlausibleCorrectMetadata2 = {"test_type": "Expected Correct"};
    let agentPercentScorePlausibleIncorrectMetadata2 = {"test_type": "Expected Incorrect"};
    let agentPercentScoreImplausibleCorrectMetadata2 = {"test_type": "Unexpected Correct"};
    let agentPercentScoreImplausibleIncorrectMetadata2 = {"test_type": "Unexpected Incorrect"};

    calculatePercentObjectByScore(scoreOverallCorrect, scoreOverallIncorrect, percentScoreOverallCorrect);
    calculatePercentObjectByScore(scoreOverallIncorrect, scoreOverallCorrect, percentScoreOverallIncorrect);
    calculatePercentObjectByScore(scorePlausibleCorrect, scorePlausibleIncorrect, percentScorePlausibleCorrect);
    calculatePercentObjectByScore(scorePlausibleIncorrect, scorePlausibleCorrect, percentScorePlausibleIncorrect);
    calculatePercentObjectByScore(scoreImplausibleCorrect, scoreImplausibleIncorrect, percentScoreImplausibleCorrect);
    calculatePercentObjectByScore(scoreImplausibleIncorrect, scoreImplausibleCorrect, percentScoreImplausibleIncorrect);

    statsByScoreObject["plausiblePercentTotal"] = [percentScoreOverallCorrect, percentScoreOverallIncorrect, percentScorePlausibleCorrect,
        percentScorePlausibleIncorrect, percentScoreImplausibleCorrect, percentScoreImplausibleIncorrect].reverse();

    calculatePercentObjectByScore(scoreOverallCorrectMetadata1, scoreOverallIncorrectMetadata1, percentScoreOverallCorrectMetadata1);
    calculatePercentObjectByScore(scoreOverallIncorrectMetadata1, scoreOverallCorrectMetadata1, percentScoreOverallIncorrectMetadata1);
    calculatePercentObjectByScore(scorePlausibleCorrectMetadata1, scorePlausibleIncorrectMetadata1, percentScorePlausibleCorrectMetadata1);
    calculatePercentObjectByScore(scorePlausibleIncorrectMetadata1, scorePlausibleCorrectMetadata1, percentScorePlausibleIncorrectMetadata1);
    calculatePercentObjectByScore(scoreImplausibleCorrectMetadata1, scoreImplausibleIncorrectMetadata1, percentScoreImplausibleCorrectMetadata1);
    calculatePercentObjectByScore(scoreImplausibleIncorrectMetadata1, scoreImplausibleCorrectMetadata1, percentScoreImplausibleIncorrectMetadata1);

    statsByScoreObject["plausiblePercentMetadata1"] = [percentScoreOverallCorrectMetadata1, percentScoreOverallIncorrectMetadata1, percentScorePlausibleCorrectMetadata1,
        percentScorePlausibleIncorrectMetadata1, percentScoreImplausibleCorrectMetadata1, percentScoreImplausibleIncorrectMetadata1].reverse();

    calculatePercentObjectByScore(scoreOverallCorrectMetadata2, scoreOverallIncorrectMetadata2, percentScoreOverallCorrectMetadata2);
    calculatePercentObjectByScore(scoreOverallIncorrectMetadata2, scoreOverallCorrectMetadata2, percentScoreOverallIncorrectMetadata2);
    calculatePercentObjectByScore(scorePlausibleCorrectMetadata2, scorePlausibleIncorrectMetadata2, percentScorePlausibleCorrectMetadata2);
    calculatePercentObjectByScore(scorePlausibleIncorrectMetadata2, scorePlausibleCorrectMetadata2, percentScorePlausibleIncorrectMetadata2);
    calculatePercentObjectByScore(scoreImplausibleCorrectMetadata2, scoreImplausibleIncorrectMetadata2, percentScoreImplausibleCorrectMetadata2);
    calculatePercentObjectByScore(scoreImplausibleIncorrectMetadata2, scoreImplausibleCorrectMetadata2, percentScoreImplausibleIncorrectMetadata2);

    statsByScoreObject["plausiblePercentMetadata2"] = [percentScoreOverallCorrectMetadata2, percentScoreOverallIncorrectMetadata2, percentScorePlausibleCorrectMetadata2,
        percentScorePlausibleIncorrectMetadata2, percentScoreImplausibleCorrectMetadata2, percentScoreImplausibleIncorrectMetadata2].reverse();

    
    calculatePercentObjectByScore(agentScoreOverallCorrect, agentScoreOverallIncorrect, agentPercentScoreOverallCorrect);
    calculatePercentObjectByScore(agentScoreOverallIncorrect, agentScoreOverallCorrect, agentPercentScoreOverallIncorrect);
    calculatePercentObjectByScore(agentScorePlausibleCorrect, agentScorePlausibleIncorrect, agentPercentScorePlausibleCorrect);
    calculatePercentObjectByScore(agentScorePlausibleIncorrect, agentScorePlausibleCorrect, agentPercentScorePlausibleIncorrect);
    calculatePercentObjectByScore(agentScoreImplausibleCorrect, agentScoreImplausibleIncorrect, agentPercentScoreImplausibleCorrect);
    calculatePercentObjectByScore(agentScoreImplausibleIncorrect, agentScoreImplausibleCorrect, agentPercentScoreImplausibleIncorrect);

    statsByScoreObject["expectedPercentTotal"] = [agentPercentScoreOverallCorrect, agentPercentScoreOverallIncorrect, agentPercentScorePlausibleCorrect,
        agentPercentScorePlausibleIncorrect, agentPercentScoreImplausibleCorrect, agentPercentScoreImplausibleIncorrect].reverse();

    calculatePercentObjectByScore(agentScoreOverallCorrectMetadata1, agentScoreOverallIncorrectMetadata1, agentPercentScoreOverallCorrectMetadata1);
    calculatePercentObjectByScore(agentScoreOverallIncorrectMetadata1, agentScoreOverallCorrectMetadata1, agentPercentScoreOverallIncorrectMetadata1);
    calculatePercentObjectByScore(agentScorePlausibleCorrectMetadata1, agentScorePlausibleIncorrectMetadata1, agentPercentScorePlausibleCorrectMetadata1);
    calculatePercentObjectByScore(agentScorePlausibleIncorrectMetadata1, agentScorePlausibleCorrectMetadata1, agentPercentScorePlausibleIncorrectMetadata1);
    calculatePercentObjectByScore(agentScoreImplausibleCorrectMetadata1, agentScoreImplausibleIncorrectMetadata1, agentPercentScoreImplausibleCorrectMetadata1);
    calculatePercentObjectByScore(agentScoreImplausibleIncorrectMetadata1, agentScoreImplausibleCorrectMetadata1, agentPercentScoreImplausibleIncorrectMetadata1);

    statsByScoreObject["expectedPercentMetadata1"] = [agentPercentScoreOverallCorrectMetadata1, agentPercentScoreOverallIncorrectMetadata1, agentPercentScorePlausibleCorrectMetadata1,
        agentPercentScorePlausibleIncorrectMetadata1, agentPercentScoreImplausibleCorrectMetadata1, agentPercentScoreImplausibleIncorrectMetadata1].reverse();

    calculatePercentObjectByScore(agentScoreOverallCorrectMetadata2, agentScoreOverallIncorrectMetadata2, agentPercentScoreOverallCorrectMetadata2);
    calculatePercentObjectByScore(agentScoreOverallIncorrectMetadata2, agentScoreOverallCorrectMetadata2, agentPercentScoreOverallIncorrectMetadata2);
    calculatePercentObjectByScore(agentScorePlausibleCorrectMetadata2, agentScorePlausibleIncorrectMetadata2, agentPercentScorePlausibleCorrectMetadata2);
    calculatePercentObjectByScore(agentScorePlausibleIncorrectMetadata2, agentScorePlausibleCorrectMetadata2, agentPercentScorePlausibleIncorrectMetadata2);
    calculatePercentObjectByScore(agentScoreImplausibleCorrectMetadata2, agentScoreImplausibleIncorrectMetadata2, agentPercentScoreImplausibleCorrectMetadata2);
    calculatePercentObjectByScore(agentScoreImplausibleIncorrectMetadata2, agentScoreImplausibleCorrectMetadata2, agentPercentScoreImplausibleIncorrectMetadata2);

    statsByScoreObject["expectedPercentMetadata2"] = [agentPercentScoreOverallCorrectMetadata2, agentPercentScoreOverallIncorrectMetadata2, agentPercentScorePlausibleCorrectMetadata2,
        agentPercentScorePlausibleIncorrectMetadata2, agentPercentScoreImplausibleCorrectMetadata2, agentPercentScoreImplausibleIncorrectMetadata2].reverse();

    return statsByScoreObject;
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

const calculateTotalTests = function(totalsObj) {
    let highestTotal = 0;
    for(const prop in totalsObj) {
        if(totalsObj[prop] > highestTotal) {
            highestTotal = totalsObj[prop];
        }
    }

    return highestTotal;
}

const calculatePercentObjectByTestType = function(scoreObj, totalObj, percentObject) {
    for( const prop in totalObj) {
        if(prop !== "test_type") {
            const calculatedPercent = scoreObj[prop] / totalObj[prop] * 100;
            percentObject[prop] = Math.round(calculatedPercent);
        }
    }
}

const statsByTestType = function(testTypeStats){
    testTypeStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

    // Passive Total Objects
    let passiveScoresCorrect = [];
    let passiveScoresCorrectPercent = [];
    let passiveScoresTotal= [];
    let passiveOverallCorrect = {"test_type": "Overall"};
    let passiveOverallCorrectPercent = {"test_type": "Overall"};
    let passiveOverallTotal = {};

    let passiveScoresCorrectMetadata1 = [];
    let passiveScoresCorrectPercentMetadata1 = [];
    let passiveScoresTotalMetadata1 = [];
    let passiveOverallCorrectMetadata1 = {"test_type": "Overall"};
    let passiveOverallCorrectPercentMetadata1 = {"test_type": "Overall"};
    let passiveOverallTotalMetadata1 = {};

    let passiveScoresCorrectMetadata2 = [];
    let passiveScoresCorrectPercentMetadata2 = [];
    let passiveScoresTotalMetadata2 = [];
    let passiveOverallCorrectMetadata2 = {"test_type": "Overall"};
    let passiveOverallCorrectPercentMetadata2 = {"test_type": "Overall"};
    let passiveOverallTotalMetadata2 = {};

    let interactiveScoresCorrect = [];
    let interactiveScoresCorrectPercent = [];
    let interactiveScoresTotal = [];
    let interactiveOverallCorrect = {"test_type": "Overall"};
    let interactiveOverallCorrectPercent = {"test_type": "Overall"};
    let interactiveOverallTotal = {};

    let interactiveScoresCorrectMetadata1 = [];
    let interactiveScoresCorrectPercentMetadata1 = [];
    let interactiveScoresTotalMetadata1 = [];
    let interactiveOverallCorrectMetadata1 = {"test_type": "Overall"};
    let interactiveOverallCorrectPercentMetadata1 = {"test_type": "Overall"};
    let interactiveOverallTotalMetadata1 = {};

    let interactiveScoresCorrectMetadata2 = [];
    let interactiveScoresCorrectPercentMetadata2 = [];
    let interactiveScoresTotalMetadata2  = [];
    let interactiveOverallCorrectMetadata2 = {"test_type": "Overall"};
    let interactiveOverallCorrectPercentMetadata2 = {"test_type": "Overall"};
    let interactiveOverallTotalMetadata2 = {};

    let agentScoresCorrect = [];
    let agentScoresCorrectPercent = [];
    let agentScoresTotal = [];
    let agentOverallCorrect = {"test_type": "Overall"};
    let agentOverallCorrectPercent = {"test_type": "Overall"};
    let agentOverallTotal = {};

    let agentScoresCorrectMetadata1 = [];
    let agentScoresCorrectPercentMetadata1 = [];
    let agentScoresTotalMetadata1 = [];
    let agentOverallCorrectMetadata1 = {"test_type": "Overall"};
    let agentOverallCorrectPercentMetadata1 = {"test_type": "Overall"};
    let agentOverallTotalMetadata1 = {};

    let agentScoresCorrectMetadata2 = [];
    let agentScoresCorrectPercentMetadata2 = [];
    let agentScoresTotalMetadata2  = [];
    let agentOverallCorrectMetadata2 = {"test_type": "Overall"};
    let agentOverallCorrectPercentMetadata2 = {"test_type": "Overall"};
    let agentOverallTotalMetadata2 = {};



    for(let i=0; i < testTypeStats.length; i++) {
        const performer = testTypeStats[i]._id.performer;
        if(testTypeStats[i]._id.category === "interactive") {
            if(testTypeStats[i]._id.correct === 1) {
                updateTestTypeScoreObj(interactiveScoresCorrect, testTypeStats[i]);
                updateTestTypeTotalsObj(interactiveOverallCorrect, testTypeStats[i]);
                if(testTypeStats[i]._id.metadata === "level1") {
                    updateTestTypeScoreObj(interactiveScoresCorrectMetadata1, testTypeStats[i]);
                    updateTestTypeTotalsObj(interactiveOverallCorrectMetadata1, testTypeStats[i]);
                }
                if(testTypeStats[i]._id.metadata === "level2") {
                    updateTestTypeScoreObj(interactiveScoresCorrectMetadata2, testTypeStats[i]);
                    updateTestTypeTotalsObj(interactiveOverallCorrectMetadata2, testTypeStats[i]);
                }
            } 
            updateTestTypeScoreObj(interactiveScoresTotal, testTypeStats[i]);
            updateTestTypeTotalsObj(interactiveOverallTotal, testTypeStats[i]);
            if(testTypeStats[i]._id.metadata === "level1") {
                updateTestTypeScoreObj(interactiveScoresTotalMetadata1, testTypeStats[i]);
                updateTestTypeTotalsObj(interactiveOverallTotalMetadata1, testTypeStats[i]);
            }
            if(testTypeStats[i]._id.metadata === "level2") {
                updateTestTypeScoreObj(interactiveScoresTotalMetadata2, testTypeStats[i]);
                updateTestTypeTotalsObj(interactiveOverallTotalMetadata2, testTypeStats[i]);
            }
        } else if(testTypeStats[i]._id.test_type === "agents") {
            if(testTypeStats[i]._id.correct === 1) {
                updateTestTypeScoreObj(agentScoresCorrect, testTypeStats[i]);
                updateTestTypeTotalsObj(agentOverallCorrect, testTypeStats[i]);
                if(testTypeStats[i]._id.metadata === "level1") {
                    updateTestTypeScoreObj(agentScoresCorrectMetadata1, testTypeStats[i]);
                    updateTestTypeTotalsObj(agentOverallCorrectMetadata1, testTypeStats[i]);
                }
                if(testTypeStats[i]._id.metadata === "level2") {
                    updateTestTypeScoreObj(agentScoresCorrectMetadata2, testTypeStats[i]);
                    updateTestTypeTotalsObj(agentOverallCorrectMetadata2, testTypeStats[i]);
                }
            } 
            updateTestTypeScoreObj(agentScoresTotal, testTypeStats[i]);
            updateTestTypeTotalsObj(agentOverallTotal, testTypeStats[i]);
            if(testTypeStats[i]._id.metadata === "level1") {
                updateTestTypeScoreObj(agentScoresTotalMetadata1, testTypeStats[i]);
                updateTestTypeTotalsObj(agentOverallTotalMetadata1, testTypeStats[i]);
            }
            if(testTypeStats[i]._id.metadata === "level2") {
                updateTestTypeScoreObj(agentScoresTotalMetadata2, testTypeStats[i]);
                updateTestTypeTotalsObj(agentOverallTotalMetadata2, testTypeStats[i]);
            }
        } else {
            if(testTypeStats[i]._id.correct === 1) {
                updateTestTypeScoreObj(passiveScoresCorrect, testTypeStats[i]);
                updateTestTypeTotalsObj(passiveOverallCorrect, testTypeStats[i]);
                if(testTypeStats[i]._id.metadata === "level1") {
                    updateTestTypeScoreObj(passiveScoresCorrectMetadata1, testTypeStats[i]);
                    updateTestTypeTotalsObj(passiveOverallCorrectMetadata1, testTypeStats[i]);
                }
                if(testTypeStats[i]._id.metadata === "level2") {
                    updateTestTypeScoreObj(passiveScoresCorrectMetadata2, testTypeStats[i]);
                    updateTestTypeTotalsObj(passiveOverallCorrectMetadata2, testTypeStats[i]);
                }
            } 
            updateTestTypeScoreObj(passiveScoresTotal, testTypeStats[i]);
            updateTestTypeTotalsObj(passiveOverallTotal, testTypeStats[i]);
            if(testTypeStats[i]._id.metadata === "level1") {
                updateTestTypeScoreObj(passiveScoresTotalMetadata1, testTypeStats[i]);
                updateTestTypeTotalsObj(passiveOverallTotalMetadata1, testTypeStats[i]);
            }
            if(testTypeStats[i]._id.metadata === "level2") {
                updateTestTypeScoreObj(passiveScoresTotalMetadata2, testTypeStats[i]);
                updateTestTypeTotalsObj(passiveOverallTotalMetadata2, testTypeStats[i]);
            }
        }
    }

    passiveScoresCorrect = sortScoreArray(passiveScoresCorrect);
    passiveScoresTotal = sortScoreArray(passiveScoresTotal);
    for(let j=0; j < passiveScoresCorrect.length; j++) {
        let newObj = {"test_type": passiveScoresCorrect[j]["test_type"]};
        calculatePercentObjectByTestType(passiveScoresCorrect[j], passiveScoresTotal[j], newObj);
        passiveScoresCorrectPercent.push(newObj);
    }
    passiveScoresCorrectMetadata1 = sortScoreArray(passiveScoresCorrectMetadata1);
    passiveScoresTotalMetadata1 = sortScoreArray(passiveScoresTotalMetadata1);
    for(let j=0; j < passiveScoresCorrectMetadata1.length; j++) {
        let newObj = {"test_type": passiveScoresCorrectMetadata1[j]["test_type"]};
        calculatePercentObjectByTestType(passiveScoresCorrectMetadata1[j], passiveScoresTotalMetadata1[j], newObj);
        passiveScoresCorrectPercentMetadata1.push(newObj);
    }
    passiveScoresCorrectMetadata2 = sortScoreArray(passiveScoresCorrectMetadata2);
    passiveScoresTotalMetadata2 = sortScoreArray(passiveScoresTotalMetadata2);
    for(let j=0; j < passiveScoresCorrectMetadata2.length; j++) {
        let newObj = {"test_type": passiveScoresCorrectMetadata2[j]["test_type"]};
        calculatePercentObjectByTestType(passiveScoresCorrectMetadata2[j], passiveScoresTotalMetadata2[j], newObj);
        passiveScoresCorrectPercentMetadata2.push(newObj);
    }

    interactiveScoresCorrect = sortScoreArray(interactiveScoresCorrect);
    interactiveScoresTotal = sortScoreArray(interactiveScoresTotal);
    for(let j=0; j < interactiveScoresCorrect.length; j++) {
        let newObj = {"test_type": interactiveScoresCorrect[j]["test_type"]};
        calculatePercentObjectByTestType(interactiveScoresCorrect[j], interactiveScoresTotal[j], newObj);
        interactiveScoresCorrectPercent.push(newObj);
    }
    interactiveScoresCorrectMetadata1 = sortScoreArray(interactiveScoresCorrectMetadata1);
    interactiveScoresTotalMetadata1 = sortScoreArray(interactiveScoresTotalMetadata1);
    for(let j=0; j < interactiveScoresCorrectMetadata1.length; j++) {
        let newObj = {"test_type": interactiveScoresCorrectMetadata1[j]["test_type"]};
        calculatePercentObjectByTestType(interactiveScoresCorrectMetadata1[j], interactiveScoresTotalMetadata1[j], newObj);
        interactiveScoresCorrectPercentMetadata1.push(newObj);
    }
    interactiveScoresCorrectMetadata2 = sortScoreArray(interactiveScoresCorrectMetadata2);
    interactiveScoresTotalMetadata2 = sortScoreArray(interactiveScoresTotalMetadata2);
    for(let j=0; j < interactiveScoresCorrectMetadata2.length; j++) {
        let newObj = {"test_type": interactiveScoresCorrectMetadata2[j]["test_type"]};
        calculatePercentObjectByTestType(interactiveScoresCorrectMetadata2[j], interactiveScoresTotalMetadata2[j], newObj);
        interactiveScoresCorrectPercentMetadata2.push(newObj);
    }

    agentScoresCorrect = sortScoreArray(agentScoresCorrect);
    agentScoresTotal = sortScoreArray(agentScoresTotal);
    for(let j=0; j < agentScoresCorrect.length; j++) {
        let newObj = {"test_type": agentScoresCorrect[j]["test_type"]};
        calculatePercentObjectByTestType(agentScoresCorrect[j], agentScoresTotal[j], newObj);
        agentScoresCorrectPercent.push(newObj);
    }
    agentScoresCorrectMetadata1 = sortScoreArray(agentScoresCorrectMetadata1);
    agentScoresTotalMetadata1 = sortScoreArray(agentScoresTotalMetadata1);
    for(let j=0; j < agentScoresCorrectMetadata1.length; j++) {
        let newObj = {"test_type": agentScoresCorrectMetadata1[j]["test_type"]};
        calculatePercentObjectByTestType(agentScoresCorrectMetadata1[j], agentScoresTotalMetadata1[j], newObj);
        agentScoresCorrectPercentMetadata1.push(newObj);
    }
    agentScoresCorrectMetadata2 = sortScoreArray(agentScoresCorrectMetadata2);
    agentScoresTotalMetadata2 = sortScoreArray(agentScoresTotalMetadata2);
    for(let j=0; j < agentScoresCorrectMetadata2.length; j++) {
        let newObj = {"test_type": agentScoresCorrectMetadata2[j]["test_type"]};
        calculatePercentObjectByTestType(agentScoresCorrectMetadata2[j], agentScoresTotalMetadata2[j], newObj);
        agentScoresCorrectPercentMetadata2.push(newObj);
    }

    calculatePercentObjectByTestType(passiveOverallCorrect, passiveOverallTotal, passiveOverallCorrectPercent);
    calculatePercentObjectByTestType(passiveOverallCorrectMetadata1, passiveOverallTotalMetadata1, passiveOverallCorrectPercentMetadata1);
    calculatePercentObjectByTestType(passiveOverallCorrectMetadata2, passiveOverallTotalMetadata2, passiveOverallCorrectPercentMetadata2);

    calculatePercentObjectByTestType(interactiveOverallCorrect, interactiveOverallTotal, interactiveOverallCorrectPercent);
    calculatePercentObjectByTestType(interactiveOverallCorrectMetadata1, interactiveOverallTotalMetadata1, interactiveOverallCorrectPercentMetadata1);
    calculatePercentObjectByTestType(interactiveOverallCorrectMetadata2, interactiveOverallTotalMetadata2, interactiveOverallCorrectPercentMetadata2);

    calculatePercentObjectByTestType(agentOverallCorrect, agentOverallTotal, agentOverallCorrectPercent);
    calculatePercentObjectByTestType(agentOverallCorrectMetadata1, agentOverallTotalMetadata1, agentOverallCorrectPercentMetadata1);
    calculatePercentObjectByTestType(agentOverallCorrectMetadata2, agentOverallTotalMetadata2, agentOverallCorrectPercentMetadata2);

    const typeStatsObj = {
        passiveCorrect: [passiveOverallCorrect].concat(passiveScoresCorrect).reverse(),
        passiveTotal: calculateTotalTests(passiveOverallTotal),
        passiveCorrectPercent: [passiveOverallCorrectPercent].concat(passiveScoresCorrectPercent).reverse(),
        passiveCorrectMetadata1: [passiveOverallCorrectMetadata1].concat(passiveScoresCorrectMetadata1).reverse(),
        passiveTotalMetadata1: calculateTotalTests(passiveOverallTotalMetadata1),
        passiveCorrectPercentMetadata1: [passiveOverallCorrectPercentMetadata1].concat(passiveScoresCorrectPercentMetadata1).reverse(),
        passiveCorrectMetadata2: [passiveOverallCorrectMetadata2].concat(passiveScoresCorrectMetadata2).reverse(),
        passiveTotalMetadata2: calculateTotalTests(passiveOverallTotalMetadata2),
        passiveCorrectPercentMetadata2: [passiveOverallCorrectPercentMetadata2].concat(passiveScoresCorrectPercentMetadata2).reverse(),

        interactiveCorrect: [interactiveOverallCorrect].concat(interactiveScoresCorrect).reverse(),
        interactiveTotal: calculateTotalTests(interactiveOverallTotal),
        interactiveCorrectPercent: [interactiveOverallCorrectPercent].concat(interactiveScoresCorrectPercent).reverse(),
        interactiveCorrectMetadata1: [interactiveOverallCorrectMetadata1].concat(interactiveScoresCorrectMetadata1).reverse(),
        interactiveTotalMetadata1: calculateTotalTests(interactiveOverallTotalMetadata1),
        interactiveCorrectPercentMetadata1: [interactiveOverallCorrectPercentMetadata1].concat(interactiveScoresCorrectPercentMetadata1).reverse(),
        interactiveCorrectMetadata2: [interactiveOverallCorrectMetadata2].concat(interactiveScoresCorrectMetadata2).reverse(),
        interactiveTotalMetadata2: calculateTotalTests(interactiveOverallTotalMetadata2),
        interactiveCorrectPercentMetadata2: [interactiveOverallCorrectPercentMetadata2].concat(interactiveScoresCorrectPercentMetadata2).reverse(),

        agentCorrect: [agentOverallCorrect].concat(agentScoresCorrect).reverse(),
        agentTotal: calculateTotalTests(agentOverallTotal),
        agentCorrectPercent: [agentOverallCorrectPercent].concat(agentScoresCorrectPercent).reverse(),
        agentCorrectMetadata1: [agentOverallCorrectMetadata1].concat(agentScoresCorrectMetadata1).reverse(),
        agentTotalMetadata1: calculateTotalTests(agentOverallTotalMetadata1),
        agentCorrectPercentMetadata1: [agentOverallCorrectPercentMetadata1].concat(agentScoresCorrectPercentMetadata1).reverse(),
        agentCorrectMetadata2: [agentOverallCorrectMetadata2].concat(agentScoresCorrectMetadata2).reverse(),
        agentTotalMetadata2: calculateTotalTests(agentOverallTotalMetadata2),
        agentCorrectPercentMetadata2: [agentOverallCorrectPercentMetadata2].concat(agentScoresCorrectPercentMetadata2).reverse()
    }

    return typeStatsObj;
}

module.exports = {
    statsByScore,
    statsByTestType
};