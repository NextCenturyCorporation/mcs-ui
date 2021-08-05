import React from 'react';

export const getStats = (resultsData) => {
    const totalResults = resultsData.length;
    let numCorrect = 0;
    let numIncorrect = 0;
    let numCorrectWeight = 0;
    let numIncorrectWeight = 0;
    let weightedTotal = 0;

    for(let i=0; i < resultsData.length; i++) {
        if(resultsData[i].score.score === 1) {
            numCorrect++;
            numCorrectWeight = numCorrectWeight + resultsData[i].score.weighted_score;
        } else {
            numIncorrect++;
            numIncorrectWeight = numIncorrectWeight + resultsData[i].score.weighted_score_worth;
        }
        weightedTotal = weightedTotal + resultsData[i].score.weighted_score_worth;
    }

    const correctAvg = (numCorrect/totalResults).toFixed(4);
    const correctWeightAvg = (numCorrectWeight/weightedTotal).toFixed(4);
    let standardError = 0;
    let standardErrorWeight = 0;

    for(let i=0; i < resultsData.length; i++) {
        standardError = standardError + Math.pow((resultsData[i].score.score - correctAvg), 2);
        standardErrorWeight = standardErrorWeight + Math.pow((resultsData[i].score.weighted_score - correctWeightAvg), 2);
    }

    const sem = ((Math.sqrt(standardError/totalResults) / Math.sqrt(totalResults)) * 100).toFixed(4);
    const semWeighted = ((Math.sqrt(standardErrorWeight/weightedTotal) / Math.sqrt(weightedTotal)) * 100).toFixed(4);

    let correctString = " Correct: " + numCorrect + "/" + totalResults + " (" + 
        (numCorrect/totalResults * 100).toFixed(2)+ "%, SEM: " + sem + ")  Weighted: " + numCorrectWeight + "/" + weightedTotal +
        " (" + (numCorrectWeight/weightedTotal * 100).toFixed(2)+ "%, SEM: " + semWeighted + ")";
    let incorrectString = " Incorrect: " + numIncorrect + "/" + totalResults + " (" + 
        (numIncorrect/totalResults * 100).toFixed(2)+ "%) Weighted: " + numIncorrectWeight + "/" + weightedTotal +
        " (" + (numIncorrectWeight/weightedTotal * 100).toFixed(2)+ "%)";

    return {correct:correctString, incorrect:incorrectString};
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
        </>
    );
}    
