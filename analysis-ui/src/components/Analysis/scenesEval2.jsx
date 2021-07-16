import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import FlagCheckboxMutation from './flagCheckboxMutation';
import {EvalConstants} from './evalConstants';
import ScoreTable from './scoreTable';
import InteractiveScenePlayer from './interactiveScenePlayer';

const historyQueryName = "getEval2History";
const sceneQueryName = "getEval2Scene";

let constantsObject = {};
let currentState = {};

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

// TODO: Merge back in with Scenes view?
class ScenesEval2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPerformerKey: 0,
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentSceneNum: (props.value.scene !== undefined && props.value.scene !== null) ? parseInt(props.value.scene) : 1,
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

    changePerformer = (performerKey, performer, colorCallback, id="") => {
        this.setState({ currentPerformerKey: performerKey, currentPerformer: performer}, ()=> {
            colorCallback(performer, id)
        });
    }

    getStyleForPerformer(performer, id="") {
        const getColor = (performer) => {
            return (
                performer === this.state.currentPerformer ? '#0062cc' :
                String(performer).includes("IBM-MIT-Harvard-Stanford") ? "rgb(0, 160, 210, 1)" :
                String(performer).includes("MESS-UCBerkeley") ? "rgb(68, 77, 93, 1)" :
                String(performer).includes("OPICS") ? "rgb(217, 85, 85, 1)" :
                String(performer).includes("TA2 Baseline") ? "rgb(138, 85, 217, 1)" :
                "inherit"
            );
        }

        if(id!=="") {
            document.getElementById(id).style.backgroundColor = getColor(performer);
        } else {
            return (
                getColor(performer)
            );
        }
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

    // Switching types for testNum, so need to pad them to match existing 
    // file names
    addLeadingZeroes = (testNum) => {
        return _.padStart(testNum.toString(), 4, '0');
    }

    createVideoLink = (bucketName) => {
        return constantsObject[bucketName] + constantsObject["performerPrefixMapping"][this.state.currentPerformer] + this.props.value.test_type + "-" + this.addLeadingZeroes(this.props.value.test_num) + "-" + (this.state.currentSceneNum) + constantsObject["movieExtension"];
    }

    render() {
        return (
            <Query query={mcs_history} variables={
                {"testType": this.props.value.test_type, 
                "testNum": parseInt(this.props.value.test_num)
                }}
                onCompleted={() => { if(this.props.value.scene === null) { this.changeScene(1); }}}>
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
                                                        <button className={performer === this.state.currentPerformer ? 'btn btn-primary active' : 'btn btn-secondary'} id={'toggle_performer_' + key} key={'toggle_' + performer} type="button" 
                                                            style = {{backgroundColor: this.getStyleForPerformer(performer)}} 
                                                            onClick={() => this.changePerformer(key, performer, this.getStyleForPerformer.bind(this), 'toggle_performer_' + key)}>
                                                                {performer}
                                                        </button>
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

                                                    <InteractiveScenePlayer evaluation={this.props.value.eval}
                                                        sceneVidLink={this.createVideoLink("interactiveMoviesBucket")}
                                                        topDownLink={this.createVideoLink("topDownMoviesBucket")}
                                                        sceneHistoryItem={scenesByPerformer[this.state.currentPerformer][this.state.currentSceneNum - 1]}/>
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

export default ScenesEval2;