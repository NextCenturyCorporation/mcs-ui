import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import $ from 'jquery';
import FlagCheckboxMutation from './flagCheckboxMutation';
import {EvalConstants} from './evalConstants';
import { convertValueToString } from './displayTextUtils';
import ScoreTable from './scoreTable';

const historyQueryName = "getEval2History";
const sceneQueryName = "getEval2Scene";

let constantsObject = {};
let currentState = {};
let currentStep = 0;

const mcs_history = gql`
    query getEval2History($testType: String!, $testNum: Int!){
        getEval2History(testType: $testType, testNum: $testNum) {
            eval
            performer
            name
            test_type
            test_num
            scene_num
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
    query getEval2Scene($testType: String!, $testNum: Int!){
        getEval2Scene(testType: $testType, testNum: $testNum) {
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
            test_num
            scene_num
        }
  }`;

const setConstants = function(evalNum) {
    constantsObject = EvalConstants[evalNum];
}

const scoreTableCols = [
    { dataKey: 'scene_num', title: 'Scene' },
    { dataKey: 'score.classification', title: 'Answer' },
    { dataKey: 'score.score_description', title: 'Score'},
    { dataKey: 'score.adjusted_confidence', title: 'Adjusted Confidence' },
    { dataKey: 'score.confidence', title: 'Confidence' }
]
class Scenes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPerformerKey: 0,
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentSceneNum: (props.value.scene !== undefined && props.value.scene !== null) ? parseInt(props.value.scene) : 1,
            currentObjectNum: 0,
            flagRemove: false,
            flagInterest: false,
            testType: props.value.test_type,
            testNum: props.value.test_num
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
        if(this.state.currentSceneNum !== sceneNum) {
            this.setState({ currentSceneNum: sceneNum});
            let pathname = this.props.value.history.location.pathname;
            let searchString = this.props.value.history.location.search;
    
            let sceneStringIndex = searchString.indexOf("&scene=");
            let sceneToUpdate = "&scene=" + parseInt(sceneNum);
    
            if(sceneStringIndex > -1) {
                let newSearchString = searchString.substring(0, sceneStringIndex);
                this.props.value.history.push({
                    pathname: pathname,
                    search: newSearchString + sceneToUpdate
                });
            } else {
                this.props.value.history.push({
                    pathname: pathname,
                    search: searchString + sceneToUpdate
                });
            }
    
            this.props.updateHandler("scene", parseInt(sceneNum + 1));
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

    // Switching types for testNum, so need to pad them to match existing 
    // file names
    addLeadingZeroes = (testNum) => {
        return _.padStart(testNum.toString(), 4, '0');
    }

    render() {
        return (
            <Query query={mcs_history} variables={
                {"testType": this.props.value.test_type, 
                "testNum": parseInt(this.props.value.test_num)
                }}
                onCompleted={() => {if(this.props.value.scene === null) { this.changeScene(1);}}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>
                    
                    const evals = data[historyQueryName];

                    let scenesByPerformer = _.sortBy(evals, "scene_num");
                    scenesByPerformer = _.groupBy(scenesByPerformer, "performer");
                    let performerList = Object.keys(scenesByPerformer);
                    this.setInitialPerformer(performerList[0], evals[0]);

                    setConstants(this.props.value.eval);

                    if(performerList.length > 0) {
                        return (
                            <Query query={mcs_scene} variables={
                                {"testType": this.props.value.test_type, 
                                "testNum": parseInt(this.props.value.test_num)
                                }}>
                            {
                                ({ loading, error, data }) => {
                                    if (loading) return <div>Loading ...</div> 
                                    if (error) return <div>Error</div>
                                    
                                    const scenes = data[sceneQueryName];
                                    const scenesInOrder = _.sortBy(scenes, "scene_num");
                                    this.initializeStepView();

                                    if(scenesInOrder.length > 0) {
                                        return (
                                            <div>
                                                <div className="flags-holder">
                                                    <FlagCheckboxMutation state={this.state} currentState={currentState}/>
                                                </div>
                                                { (scenesByPerformer && scenesByPerformer[this.state.currentPerformer] && scenesByPerformer[this.state.currentPerformer][0]["category"] === "observation") && 
                                                    <div>
                                                        <div className="movie-holder">
                                                            <div className="movie-left-right">
                                                                <div className="movie-text"><b>Scene 1:</b>&nbsp;&nbsp;{scenesInOrder[0].answer.choice}</div>
                                                                <div className="movie-text"><b>Scene 3:</b>&nbsp;&nbsp;{scenesInOrder[2].answer.choice}</div>
                                                            </div>
                                                            <div className="movie-center">
                                                                <video src={constantsObject["moviesBucket"] + this.props.value.test_type + "-" + this.addLeadingZeroes(this.props.value.test_num) + constantsObject["movieExtension"]} width="600" height="400" controls="controls" autoPlay={false} />
                                                            </div>
                                                            <div className="movie-left-right">
                                                                <div className="movie-text"><b>Scene 2:</b>&nbsp;&nbsp;{scenesInOrder[1].answer.choice}</div>
                                                                <div className="movie-text"><b>Scene 4:</b>&nbsp;&nbsp;{scenesInOrder[3].answer.choice}</div>
                                                            </div>
                                                        </div>
                                                    </div> 
                                                }
                                                <div className="scores_header">
                                                    <h3>Scores</h3>
                                                </div>
                                                <div className="performer-group btn-group" role="group">
                                                    {performerList.map((performer, key) =>
                                                        <button className={performer === this.state.currentPerformer ? 'btn btn-primary active' : 'btn btn-secondary'} id={'toggle_performer_' + key} key={'toggle_' + performer} type="button" onClick={() => this.changePerformer(key, performer)}>{performer}</button>
                                                    )}
                                                </div>

                                                {scenesByPerformer && scenesByPerformer[this.state.currentPerformer] &&
                                                    <ScoreTable
                                                        columns={scoreTableCols}
                                                        currentPerformerScenes={scenesByPerformer[this.state.currentPerformer]}
                                                        currentSceneNum={this.state.currentSceneNum}
                                                        changeSceneHandler={this.changeScene}
                                                        scenesInOrder={scenesInOrder}
                                                        constantsObject={constantsObject}
                                                        sortable={false}
                                                    />
                                                }

                                                { (scenesByPerformer && scenesByPerformer[this.state.currentPerformer] && scenesByPerformer[this.state.currentPerformer][0]["category"] === "interactive") && 
                                                    <div className="movie-steps-holder">
                                                        <div className="interactive-movie-holder">
                                                            <video id="interactiveMoviePlayer" src={constantsObject["interactiveMoviesBucket"] + constantsObject["performerPrefixMapping"][this.state.currentPerformer] + this.props.value.test_type + "-" + this.addLeadingZeroes(this.props.value.test_num) + "-" + (this.state.currentSceneNum) + constantsObject["movieExtension"]} width="500" height="350" controls="controls" autoPlay={false} onTimeUpdate={this.highlightStep}/>
                                                        </div>
                                                        <div className="steps-holder">
                                                            <h5>Performer Steps:</h5>
                                                            <div className="steps-container">
                                                                    <div id="stepHolder0" className="step-div step-highlight" onClick={() => this.goToVideoLocation(0)}>0: Starting Position</div>
                                                                {scenesByPerformer[this.state.currentPerformer][this.state.currentSceneNum - 1] !== undefined &&
                                                                    scenesByPerformer[this.state.currentPerformer][this.state.currentSceneNum - 1].steps.map((stepObject, key) => 
                                                                    <div key={"step_div_" + key} id={"stepHolder" + (key+1)} className="step-div" onClick={() => this.goToVideoLocation(key+1)}>
                                                                        {stepObject.stepNumber + ": " + stepObject.action + " (" + convertValueToString(stepObject.args) + ") - " + stepObject.output.return_status}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="top-down-holder">
                                                            <video id="interactiveMoviePlayer" src={constantsObject["topDownMoviesBucket"] + constantsObject["performerPrefixMapping"][this.state.currentPerformer] + this.props.value.test_type + "-" + this.addLeadingZeroes(this.props.value.test_num) + "-" + (this.state.currentSceneNum) + constantsObject["movieExtension"]} width="500" height="350" controls="controls" autoPlay={false}/>
                                                        </div>
                                                    </div> 
                                                }
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

export default Scenes;