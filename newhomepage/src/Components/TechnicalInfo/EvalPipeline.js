import React from 'react';
import '../Components.css';

function EvalPipeline() {
  return (
    <div className="main-text">
      <h2>Evaluation Pipeline</h2>
      <p>CACI's Evaluation Pipeline project is used for running MCS evaluations. The project makes use of <a href="https://www.ray.io/">Ray.io</a>, 
      an open-source famework, to scale our AI evaluation workloads in AWS to simultaneously run hundreds of evaluations. The average evaluation load in the last
      several evaluations is about thirty-thousand test scenes per team across numerous core common sense concepts. Evaluation scenes can take 
      anywhere from 20 minutes to 5 hours to complete. The ability to scale our work load and centralize the evaluation artifacts from each run allowed
      the evalution to quickly complete evaluations and disseminate results to performers and evaluators.
      </p>

      <div className="text-align-center">
        <img src="/images/Eval_Pipeline.png" alt="evaluation pipeline"/>
        </div>

      <h3>GitHub:</h3>

        <h4>MCS Evaluation Pipeline</h4>
        <h4>MCS Ingest</h4>

    </div>
  );
}

export default EvalPipeline;
