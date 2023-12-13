import React from 'react';
import '../Components.css';

function Objects() {
    return (
        <div className="main-text">
            <h2>Commonsense in the Objects Domain</h2>
            <p>
            Tasks were designed to assess AI systems' common sense about objects. Many scientific studies have examined infants' understanding that objects continue to exist when they can no longer be seen (object permanence), and the facts that objects are solid, subject to gravity, can be tracked as they move through space, among other things. Young children also develop a commonsense understanding of tool use, interactions between objects (i.e., collisions), and the numerical properties of sets of objects. As part of the MCS program, tasks were developed to assess AI common sense in these areas, using as inspiration experimental work conducted with infants and young children.
            </p>

            <div className="float-left-50">
                <div>
                    <h3>Passive Object Tasks:</h3>
                    <li><a href="/CommonsenseDomain/Task?TaskId=Collisions">Collisions</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=GravitySupport">Gravity Support</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=ObjectPermanence">Object Permanence</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=ShapeConstancy">Shape Constancy</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=SpatioTemporalContinuity">Spatio Temporal Continuity</a></li>
                </div>
            </div>

            <div className="float-left-50">
                <div>
                    <h3>Interactive Object Tasks:</h3>
                    <li><a href="/CommonsenseDomain/Task?TaskId=Arithmetic">Addition and Subtraction</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=AsymmetricToolUse">Asymmetric Tool Use</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=InteractiveObjectPermanence">Interactive Object Permanence</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=SupportRelations">Interactive Support Relations</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=MovingTargetPrediction">Moving Target Prediction</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=NumberComparison">Number Comparison</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=OccludedTrajectory">Occluded Trajectory</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=InteractiveCollision">Predict Post-Collision Trajectory</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=SecondaryToolUse">Secondary Tool Use</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=Solidity">Solidity</a></li>
                    <li><a href="/CommonsenseDomain/Task?TaskId=ToolUse">Tool Use</a></li>
                </div>
            </div>
        </div>
    );
}

export default Objects;
