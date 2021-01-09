import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import $ from 'jquery';
//import FlagCheckboxMutation from './flagCheckboxMutation';
import {EvalConstants} from './evalConstants';

const historyQueryName = "getEval3History";
const sceneQueryName = "getEval3Scene";

let constantsObject = {};
//let currentState = {};
let currentStep = 0;

const mcs_history = gql`
    query getEval3History($categoryType: String!, $sceneNum: Int!){
        getEval3History(categoryType: $categoryType, sceneNum: $sceneNum) {
            eval
            performer
            name
            test_type
            scene_num
            scene_part_num
            score
            steps
            flags
            step_counter
            category
            category_type
            category_pair
        }
  }`;

const mcs_scene= gql`
    query getEval3Scene($sceneName: String, $sceneNum: Int){
        getEval3Scene(sceneName: $sceneName, sceneNum: $sceneNum) {
            name
            ceilingMaterial
            floorMaterial
            wallMaterial
            wallColors
            performerStart
            objects
            goal
            answer
            eval
            test_type
            scene_num
            scene_part_num
        }
  }`;

const setConstants = function(evalNum) {
    constantsObject = EvalConstants[evalNum];
}

// TODO: Merge back in with Scenes view
class ScenesEval3 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPerformerKey: 0,
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentSceneNum: props.value.scene_part_num !== undefined ? parseInt(props.value.scene_part_num) - 1 : 0,
            currentObjectNum: 0,
            flagRemove: false,
            flagInterest: false,
            testType: props.value.test_type,
            categoryType: props.value.category_type,
            sceneNum: props.value.scene_num
        };
    }

    setInitialPerformer = (performer, firstEval) => {
        if(this.state.currentPerformer === "") {
            this.setState({
                currentPerformer: performer
            });
        }

        if(this.state.currentPerformer === "" && firstEval !== null && firstEval !== undefined) {
            this.setState({
                flagRemove: firstEval["flags"]["remove"],
                flagInterest: firstEval["flags"]["interest"]
            });
        }
    }

    changePerformer = (performerKey, performer) => {
        this.setState({ currentPerformerKey: performerKey, currentPerformer: performer});
    }

    changeScene = (sceneNum) => {
        this.setState({ currentSceneNum: sceneNum});
    }

    changeObjectDisplay = (objectKey) => {
        $('#object_button_' + this.state.currentObjectNum ).toggleClass( "active" );
        $('#object_button_' + objectKey ).toggleClass( "active" );

        this.setState({ currentObjectNum: objectKey});
    }

    convertArrayToString = (arrayToConvert) => {
        let newStr = "";
        for(let i=0; i < arrayToConvert.length; i++) {
            newStr = newStr + this.convertValueToString(arrayToConvert[i]);

            if(i < arrayToConvert.length -1) {
                newStr = newStr + ", ";
            }
        }

        return newStr;
    }

    convertObjectToString = (objectToConvert) => {
        let newStr = "";
        Object.keys(objectToConvert).forEach((key, index) => {
            newStr = newStr + key + ": " + this.convertValueToString(objectToConvert[key]);

            if(index < Object.keys(objectToConvert).length - 1) {
                newStr = newStr + ", ";
            }
        })

        return newStr;
    }

    convertValueToString = (valueToConvert) => {
        if(Array.isArray(valueToConvert) && valueToConvert !== null) {
            return this.convertArrayToString(valueToConvert);
        }

        if(typeof valueToConvert === 'object' && valueToConvert !== null) {
            return this.convertObjectToString(valueToConvert);
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

    findObjectTabName = (sceneObject) => {
        if(sceneObject.shape !== undefined && sceneObject.shape !== null) {
            return sceneObject.shape;
        }

        if(sceneObject.id.indexOf('occluder_wall')) {
            return "occluder wall";
        }

        if(sceneObject.id.indexOf('occluder_pole')) {
            return "occluder pole";
        }

        return sceneObject.type;
    }

    checkSceneObjectKey = (scene, objectKey, key, labelPrefix = "") => {
        if(objectKey !== 'objects' && objectKey !== 'goal' && objectKey !== 'name') {
            return (
                <tr key={'scene_prop_' + key}>
                    <td className="bold-label">{labelPrefix + objectKey}:</td>
                    <td className="scene-text">{this.convertValueToString(scene[objectKey])}</td>
                </tr>
            );
        } else if(objectKey === 'goal') {
            return (
                Object.keys(scene["goal"]).map((goalObjectKey, goalKey) => 
                    this.checkSceneObjectKey(scene["goal"], goalObjectKey, goalKey, "goal."))
            );
        } else if(objectKey === 'name') {
            return (
                <tr key={'scene_prop_' + key}>
                    <td className="bold-label">{labelPrefix + objectKey}:</td>
                    <td className="scene-text">{this.convertValueToString(scene[objectKey])} (<a href={constantsObject["sceneBucket"] + scene[objectKey] + constantsObject["sceneExtension"]} download>Download Scene File</a>)</td>
                </tr>
            );
        }
    }

    highlightStep = (e) => {
        // First one is at 0.2 
        let currentTimeNum = Math.floor(document.getElementById("interactiveMoviePlayer").currentTime + 0.8);
        if(currentTimeNum !== currentStep) {
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
            currentStep = currentTimeNum;
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
            if(document.getElementById("stepHolder" + currentStep) !== null) {
                document.getElementById("stepHolder" + currentStep).scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
            }
        }
    }

    initializeStepView = () => {
        $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
        currentStep = 0;
        $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
        if(document.getElementById("stepHolder" + currentStep) !== null) {
            document.getElementById("stepHolder" + currentStep).scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
        }
    }

    goToVideoLocation = (jumpTime) => {
        if( document.getElementById("interactiveMoviePlayer") !== null) {
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
            currentStep = jumpTime;
            document.getElementById("interactiveMoviePlayer").currentTime = jumpTime;
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
        }
    }

    getSceneNamePrefix = (name) => {
        return name.substring(0, name.indexOf('_')) + '*';
    }

    render() {
        return (
            <Query query={mcs_history} variables={
                {"categoryType":  this.props.value.category_type, 
                "sceneNum": parseInt(this.props.value.scene_num), 
                }} fetchPolicy='network-only'>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>
                    
                    const evals = data[historyQueryName];
                    console.log(evals);
                    let scenesByPerformer = _.sortBy(evals, "scene_part_num");
                    scenesByPerformer = _.groupBy(scenesByPerformer, "performer");
                    let performerList = Object.keys(scenesByPerformer);
                    this.setInitialPerformer(performerList[0], evals[0]);
                    
                    setConstants("Eval3");
                    
                    console.log(scenesByPerformer);
                    let sceneNamePrefix = null;

                    if((evals !== null && evals !== undefined && evals.length > 0) &&
                        evals[0].name !== null && evals[0].name !== undefined) {
                        sceneNamePrefix = this.getSceneNamePrefix(evals[0].name);
                    }

                    if(performerList.length > 0 && sceneNamePrefix !== null) {
                        return (
                            <Query query={mcs_scene} variables={
                                {"sceneName": sceneNamePrefix, 
                                "sceneNum": parseInt(this.props.value.scene_num)
                                }}>
                            {
                                ({ loading, error, data }) => {
                                    if (loading) return <div>Loading ...</div> 
                                    if (error) return <div>Error</div>
                                    
                                    const scenes = data[sceneQueryName];
                                    console.log(scenes);
                                    const scenesInOrder = _.sortBy(scenes, "scene_part_num");
                                    this.initializeStepView();

                                    
                                    if(scenesInOrder.length > 0) {
                                        return (
                                            <div>
                                                <div className="scores_header">
                                                    <h3>Scores</h3>
                                                </div>
                                                <div className="performer-group btn-group" role="group">
                                                    {performerList.map((performer, key) =>
                                                        <button className={performer === this.state.currentPerformer ? 'btn btn-primary active' : 'btn btn-secondary'} id={'toggle_performer_' + key} key={'toggle_' + performer} type="button" onClick={() => this.changePerformer(key, performer)}>{performer}</button>
                                                    )}
                                                </div>
                                                <div className="score-table-div">
                                                    <table className="score-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Select Scene</th>
                                                                <th>Answer</th>
                                                                <th>Score</th>
                                                                <th>Confidence</th>
                                                                <th>MSE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {scenesByPerformer && scenesByPerformer[this.state.currentPerformer] && scenesByPerformer[this.state.currentPerformer].map((scoreObj, key) => 
                                                                <tr key={'peformer_score_row_' + key}>
                                                                    <td>
                                                                        <button key={"scene_button_" + scoreObj.scene_num} 
                                                                            className={this.state.currentSceneNum === scoreObj.scene_num - 1 ? 'btn btn-primary active' : 'btn btn-secondary'}
                                                                        id={"scene_btn_" + scoreObj.scene_num} type="button" onClick={() => this.changeScene(scoreObj.scene_num - 1)}>Scene {scoreObj.scene_num}</button>
                                                                    </td>
                                                                    <td>{scoreObj.score.classification}</td>
                                                                    <td>{scoreObj.score.score_description}</td>
                                                                    <td>{scoreObj.score.confidence}</td>
                                                                    <td>{scoreObj.score.mse_loss}</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="scenes_header">
                                                    <h3>View Selected Scene Info</h3>
                                                </div>
                                                    { (scenesByPerformer && scenesByPerformer[this.state.currentPerformer] && scenesByPerformer[this.state.currentPerformer][0]["category"] === "interactive") && 
                                                        <div className="movie-steps-holder">
                                                            <div className="interactive-movie-holder">
                                                                <video id="interactiveMoviePlayer" src={constantsObject["interactiveMoviesBucket"] + constantsObject["performerPrefixMapping"][this.state.currentPerformer] + this.props.value.test_type + "-" + this.props.value.scene_num + "-" + (this.state.currentSceneNum+1) + constantsObject["movieExtension"]} width="500" height="350" controls="controls" autoPlay={false} onTimeUpdate={this.highlightStep}/>
                                                            </div>
                                                            <div className="steps-holder">
                                                                <h5>Performer Steps:</h5>
                                                                <div className="steps-container">
                                                                        <div id="stepHolder0" className="step-div step-highlight" onClick={() => this.goToVideoLocation(0)}>0: Starting Position</div>
                                                                    {scenesByPerformer[this.state.currentPerformer][this.state.currentSceneNum].steps.map((stepObject, key) => 
                                                                        <div key={"step_div_" + key} id={"stepHolder" + (key+1)} className="step-div" onClick={() => this.goToVideoLocation(key+1)}>
                                                                            {stepObject.stepNumber + ": " + stepObject.action + " (" + this.convertValueToString(stepObject.args) + ") - " + stepObject.output.return_status}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="top-down-holder">
                                                                <video id="interactiveMoviePlayer" src={constantsObject["topDownMoviesBucket"] + constantsObject["performerPrefixMapping"][this.state.currentPerformer] + this.props.value.test_type + "-" + this.props.value.scene_num + "-" + (this.state.currentSceneNum+1) + constantsObject["movieExtension"]} width="500" height="350" controls="controls" autoPlay={false}/>
                                                            </div>
                                                        </div> 
                                                    }
                                                <div className="scene-table-div">
                                                    <table>
                                                        <tbody>
                                                            {Object.keys(scenesInOrder[this.state.currentSceneNum]).map((objectKey, key) => 
                                                                this.checkSceneObjectKey(scenesInOrder[this.state.currentSceneNum], objectKey, key))}
                                                        </tbody>
                                                    </table>
                                                    <div className="objects_scenes_header">
                                                        <h5>Objects in Scene</h5>
                                                    </div>
                                                    <div className="object-nav">
                                                        <ul className="nav nav-tabs">
                                                            {scenesInOrder[this.state.currentSceneNum].objects.map((sceneObject, key) => 
                                                                <li className="nav-item" key={'object_tab_' + key}>
                                                                    <button id={'object_button_' + key} className={key === 0 ? 'nav-link active' : 'nav-link'} onClick={() => this.changeObjectDisplay(key)}>{this.findObjectTabName(sceneObject)}</button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="object-contents">
                                                        <table>
                                                            <tbody>
                                                                {Object.keys(scenesInOrder[this.state.currentSceneNum].objects[this.state.currentObjectNum]).map((objectKey, key) => 
                                                                    <tr key={'object_tab_' + key}>
                                                                        <td className="bold-label">{objectKey}:</td>
                                                                        <td className="scene-text">{this.convertValueToString(scenesInOrder[this.state.currentSceneNum].objects[this.state.currentObjectNum][objectKey])}</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>        
                                                </div>
                                            </div>
                                        )
                                    }  else {
                                        return <div>No Results available for these choices.</div>
                                    }
                                }
                            }
                            </Query>
                        )
                    }  else {
                        return <div>No Results available for these choices.</div>
                    }
                }
            }

            </Query>
        );
    }
}

export default ScenesEval3;