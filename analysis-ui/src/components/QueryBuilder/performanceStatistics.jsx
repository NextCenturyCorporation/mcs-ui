import React from 'react';

export const getStats = (resultsData) => {
    const totalResults = resultsData.total;
    let numCorrect = resultsData.totalCorrect;
    let numNoAnswer = resultsData.totalNoAnswer;
    let numIncorrect = totalResults - numCorrect - numNoAnswer;
    let weightedTotal = resultsData.totalWeighted;
    let numCorrectWeight = resultsData.totalCorrectWeighted;
    let numIncorrectWeight = weightedTotal - numCorrectWeight;

    const correctAvg = (numCorrect/totalResults).toFixed(4);
    const correctWeightAvg = (numCorrectWeight/weightedTotal).toFixed(4);
    
    let standardError = 0;
    for(let i=0; i < numCorrect; i++) {
        standardError = standardError + Math.pow((1 - correctAvg), 2);
    }
    for(let i=0; i < numIncorrect; i++) {
        standardError = standardError + Math.pow((0 - correctAvg), 2);
    }

    let standardErrorWeight = 0;
    for(let i=0; i < numCorrectWeight; i++) {
        standardErrorWeight = standardErrorWeight + Math.pow((1 - correctWeightAvg), 2);
    }
    for(let i=0; i < numIncorrectWeight; i++) {
        standardErrorWeight = standardErrorWeight + Math.pow((0 - correctWeightAvg), 2);
    }

    const sem = ((Math.sqrt(standardError/totalResults) / Math.sqrt(totalResults)) * 100).toFixed(4);
    const semWeighted = ((Math.sqrt(standardErrorWeight/weightedTotal) / Math.sqrt(weightedTotal)) * 100).toFixed(4);

    let correctString = " Correct: " + numCorrect + "/" + totalResults + " (" + 
        (numCorrect/totalResults * 100).toFixed(2)+ "%, SEM: " + sem + ")  Weighted: " + numCorrectWeight + "/" + weightedTotal +
        " (" + (numCorrectWeight/weightedTotal * 100).toFixed(2)+ "%, SEM: " + semWeighted + ")";
    let incorrectString = " Incorrect: " + numIncorrect + "/" + totalResults + " (" + 
        (numIncorrect/totalResults * 100).toFixed(2)+ "%) Weighted: " + numIncorrectWeight + "/" + weightedTotal +
        " (" + (numIncorrectWeight/weightedTotal * 100).toFixed(2)+ "%)";
    let numNoAnswerString = " No Answers: " + numNoAnswer + "/" + totalResults + " (" + 
        (numNoAnswer/totalResults * 100).toFixed(2)+ "%)"

    return {correct:correctString, incorrect:incorrectString, numNoAnswer: numNoAnswerString};
}

export const PerformanceStatistics = ({resultsData}) => {
    let stats = getStats(resultsData)
    return (
        <>
            <div className="query-num-performance">
                {stats.correct}
            </div>
            <div className="query-num-performance">
                {stats.incorrect}
            </div>
            <div className="query-num-performance">
                {stats.numNoAnswer}
            </div>
        </>
    );
}    
