import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
// TODO: Remove FlagCheckboxMutation component + currentState + related variables?
//import FlagCheckboxMutation from './flagCheckboxMutation';
import {EvalConstants} from './evalConstants';
import ScoreTable from './scoreTable';
import ClassificationByStepTable from './classificationByStepTable';
import InteractiveScenePlayer from './interactiveScenePlayer';

const historyQueryName = "createComplexQuery";
const historyQueryResults = "results";
const sceneQueryName = "getEvalScene";

let constantsObject = {};
//let currentState = {};

const projectionObject = {
    "eval": 1,
    "performer": 1,
    "name": 1,
    "test_type": 1,
    "test_num": 1,
    "scene_num": 1,
    "scene_goal_id": 1,
    "score": 1,
    "steps": 1,
    "flags": 1,
    "metadata": 1,
    "step_counter": 1,
    "category": 1,
    "category_type": 1,
    "category_pair": 1,
    "fullFilename": 1,
    "filename": 1,
    "fileTimestamp": 1,
    "scene.goal.sceneInfo.slices": "$mcsScenes.goal.sceneInfo.slices"
}

const create_complex_query = gql`
    query createComplexQuery($queryObject: JSON!, $projectionObject: JSON!) {
        createComplexQuery(queryObject: $queryObject, projectionObject: $projectionObject) 
    }`;

const mcs_scene= gql`
    query getEvalScene($sceneName: String, $testNum: Int){
        getEvalScene(sceneName: $sceneName, testNum: $testNum) {
            name
            ceilingMaterial
            floorMaterial
            wallMaterial
            wallColors
            performerStart
            objects
            goal
            eval
            test_num
            scene_num
        }
  }`;

const setConstants = function(evalNum) {
    constantsObject = EvalConstants[evalNum];
}

const scoreTableCols = [
    { dataKey: 'scene_num', title: 'Scene' },
    { dataKey: 'scene_goal_id', title: 'Goal ID'},
    { dataKey: 'scene.goal.sceneInfo.slices', title: 'Slices'},
    { dataKey: 'score.classification', title: 'Classification' },
    { dataKey: 'score.score_description', title: 'Score'},
    { dataKey: 'score.confidence', title: 'Confidence' }
]

class Scenes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentMetadataLevel: props.value.metadata_lvl !== undefined ? props.value.metadata_lvl : "",
            currentSceneNum: (props.value.scene !== undefined && props.value.scene !== null) ? parseInt(props.value.scene) : 1,
            //flagRemove: false,
            //flagInterest: false,
            testType: props.value.test_type,
            categoryType: props.value.category_type,
            testNum: props.value.test_num
        };
    }

    setInitialMetadataLevel = (metadata) => {
        if(this.state.currentMetadataLevel === "") {
            this.setState({
                currentMetadataLevel: metadata
            });
        }
    }

    setInitialPerformer = (performer, firstEval) => {
        if(this.state.currentPerformer === "") {
            this.setState({
                currentPerformer: performer
            });
        }

        /*
        if(this.state.currentPerformer === "" && firstEval !== null && firstEval !== undefined) {
            this.setState({
                flagRemove: firstEval["flags"]["remove"],
                flagInterest: firstEval["flags"]["interest"]
            });
        }*/
    }

    setStateObject(key, value) {
        this.setState({[key]: value});
    }

    changeScene = (sceneNum) => {
        if(this.state.currentSceneNum !== sceneNum) {
            this.setState({ currentSceneNum: sceneNum});
            let pathname = this.props.value.history.location.pathname;
            let searchString = this.props.value.history.location.search;
    
            let sceneStringIndex = searchString.indexOf("&scene=");
            let sceneToUpdate = "&scene=" + sceneNum;
    
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
            this.props.updateHandler("scene", sceneNum);
        }
    }

    getSceneNamePrefix = (name) => {
        return name.substring(0, name.indexOf('_')) + '*';
    }

    getSceneHistoryQueryObject = (evalName, categoryType, testNum) => {
        return [
            {
                fieldType: "mcs_history." + evalName,
                fieldTypeLabel: evalName,
                fieldName: "category_type",
                fieldNameLabel: "Test Type",
                fieldValue1: categoryType,
                fieldValue2: "",
                functionOperator: "contains",
                collectionDropdownToggle: 1
            },
            {
                fieldType: "mcs_history." + evalName,
                fieldTypeLabel: evalName,
                fieldName: "test_num",
                fieldNameLabel: "Test Number",
                fieldValue1: parseInt(testNum),
                fieldValue2: "",
                functionOperator: "equals",
                collectionDropdownToggle: 1
            }
        ]
    }

    checkIfScenesExist = (scenesByPerformer) =>{
        return scenesByPerformer !== undefined && scenesByPerformer[this.state.currentMetadataLevel] !== undefined
            && scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer] !== undefined;
    }

    getPrettyMetadataLabel = (metadata) => {
        if(metadata === 'level1') {
            return "Level 1";
        }
        
        if(metadata === 'level2') {
            return "Level 2";
        }

        if(metadata === 'oracle') {
            return "Oracle"
        }

        return metadata;
    }

    getSceneHistoryItem = (scenesByPerformer) => {
        if(scenesByPerformer !== undefined && scenesByPerformer !== null && this.state.currentSceneNum !== undefined) {
            let sceneNumAsString = this.state.currentSceneNum.toString();
            return scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer][sceneNumAsString];
        }
    }

    getVideoFileName = (scenesByPerformer, videoCategory) => {
        let sceneItem = this.getSceneHistoryItem(scenesByPerformer);
        if(sceneItem === undefined || sceneItem === null) {
            return "";
        }

        if(sceneItem.eval === "Evaluation 3 Results") {
            return constantsObject["moviesBucket"] +
                sceneItem.filename +
                videoCategory +
                "_" + sceneItem.fileTimestamp +
                constantsObject["movieExtension"];
        } else {
            return constantsObject["moviesBucket"] +
                sceneItem.fullFilename +
                videoCategory +
                constantsObject["movieExtension"];
        }
    }

    isSceneHistInteractive = (scenesByPerformer) => {
        return this.getSceneHistoryItem(scenesByPerformer) !== undefined
            && this.getSceneHistoryItem(scenesByPerformer)["category"] === "interactive";
    }

    render() {
        return (
            <Query query={create_complex_query} variables={
                {    
                    "queryObject":  this.getSceneHistoryQueryObject(
                        this.props.value.eval,
                        this.props.value.category_type,
                        this.props.value.test_num
                    ), 
                    "projectionObject": projectionObject
                }}
                onCompleted={() => { if(this.props.value.scene === null) { this.changeScene(1); }}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>
                    
                    const evals = data[historyQueryName][historyQueryResults];

                    let sortedScenes =  _.sortBy(evals, "scene_num");
                    let scenesByMetadata = _.groupBy(sortedScenes, "metadata");
                    let metadataList = Object.keys(scenesByMetadata);
                    let performerList = _.uniq(_.map(sortedScenes, "performer"));

                    let initialMetadataLevel = metadataList[0];

                    this.setInitialMetadataLevel(initialMetadataLevel);

                    let scenesByPerformer = _.reduce(scenesByMetadata, function(mapByMetadata, metadataValue, metadataKey) {
                        mapByMetadata[metadataKey] = _.reduce(_.groupBy(metadataValue, "performer"), function(mapByPerformer, perfValue, perfKey) {
                            mapByPerformer[perfKey] = _.reduce(perfValue, function(mapByScene, sceneValue) {
                                // scene history records are now a map with scene_num as the key instead of an array
                                mapByScene[sceneValue.scene_num.toString()] = sceneValue;
                                return mapByScene
                            }, {});
                           return mapByPerformer;
                        }, {});
                        return mapByMetadata;
                    }, {});

                    this.setInitialPerformer(performerList[0], evals[0]);
                    
                    setConstants(this.props.value.eval);

                    let sceneNamePrefix = null;
                    
                    if((evals !== null && evals !== undefined && evals.length > 0) &&
                        evals[0].name !== null && evals[0].name !== undefined) {
                        sceneNamePrefix = this.getSceneNamePrefix(evals[0].name);
                    }

                    if(metadataList.length > 0 && performerList.length > 0 && sceneNamePrefix !== null) {
                        return (
                            <Query query={mcs_scene} variables={
                                {"sceneName": sceneNamePrefix, 
                                "testNum": parseInt(this.props.value.test_num)
                                }}>
                            {
                                ({ loading, error, data }) => {
                                    if (loading) return <div>Loading ...</div> 
                                    if (error) return <div>Error</div>
                                    
                                    const scenes = data[sceneQueryName];
                                    const scenesInOrder = _.sortBy(scenes, "scene_num");

                                    if(scenesInOrder.length > 0) {
                                        if(scenesInOrder.length < this.state.currentSceneNum) {
                                            this.changeScene(scenesInOrder[0]["scene_num"]);
                                        }

                                        if(metadataList.indexOf(this.state.currentMetadataLevel) === -1) {             
                                            this.setStateObject('currentMetadataLevel', metadataList[0]);
                                        }

                                        if(performerList.indexOf(this.state.currentPerformer) === -1) {
                                            this.setStateObject('currentPerformer', performerList[0]);
                                        }

                                        return (
                                            <div>
                                                { this.checkIfScenesExist(scenesByPerformer) &&
                                                    this.getSceneHistoryItem(scenesByPerformer) !== undefined &&
                                                    this.getSceneHistoryItem(scenesByPerformer)["category"] === "passive" && 
                                                    <div>
                                                        <div className="eval3-movies">
                                                            <div>
                                                                <div><b>Scene:</b> {this.state.currentSceneNum}</div>
                                                                <video src={this.getVideoFileName(scenesByPerformer, "_visual")} width="600" height="400" controls="controls" autoPlay={false} />
                                                            </div>
                                                            <div>
                                                                <div><b>Top Down Plot</b></div>
                                                                <video src={this.getVideoFileName(scenesByPerformer, "_topdown")} width="600" height="400" controls="controls" autoPlay={false} />
                                                            </div>
                                                        </div>

                                                        <div className="scene-text">Links for other videos:</div>
                                                            <div className="scene-text">
                                                                <a href={
                                                                    this.getVideoFileName(scenesByPerformer, "_heatmap")} target="_blank" rel="noopener noreferrer">Heatmap</a>
                                                            </div>
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_depth")} target="_blank" rel="noopener noreferrer">Depth</a>
                                                            </div>
                                                            {this.state.currentMetadataLevel !== "" && this.state.currentMetadataLevel !== "level1" && 
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_segmentation")} target="_blank" rel="noopener noreferrer">Segmentation</a>
                                                            </div>}
                                                    </div> 
                                                }
                                                <div className="scores_header">
                                                    <h3>Scores</h3>
                                                </div>
                                                <div className="metadata-group btn-group" role="group">
                                                    {metadataList.map((metadataLvl, key) =>
                                                        <button className={metadataLvl === this.state.currentMetadataLevel ? 'btn btn-primary active' : 'btn btn-secondary'}
                                                            id={'toggle_metadata_' + key} key={'toggle_' + metadataLvl} type="button"
                                                            onClick={() => this.setStateObject('currentMetadataLevel', metadataLvl)}>
                                                                {this.getPrettyMetadataLabel(metadataLvl)}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="performer-group btn-group" role="group">
                                                    {performerList.map((performer, key) =>
                                                        <button className={performer === this.state.currentPerformer ? 'btn btn-primary active' : 'btn btn-secondary'}
                                                            id={'toggle_performer_' + key} key={'toggle_' + performer} type="button"
                                                            onClick={() => this.setStateObject('currentPerformer', performer)}>
                                                                {performer}
                                                        </button>
                                                    )}
                                                </div>

                                                {this.checkIfScenesExist(scenesByPerformer) &&
                                                    <ScoreTable
                                                        columns={scoreTableCols}
                                                        currentPerformerScenes={scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer]}
                                                        currentSceneNum={this.state.currentSceneNum}
                                                        changeSceneHandler={this.changeScene}
                                                        scenesInOrder={scenesInOrder}
                                                        constantsObject={constantsObject}
                                                        sortable={true}
                                                    />
                                                }

                                                { (this.checkIfScenesExist(scenesByPerformer) && (!this.isSceneHistInteractive(scenesByPerformer))) && 
                                                   <ClassificationByStepTable
                                                        evaluation={this.props.value.eval}
                                                        currentSceneHistItem={this.getSceneHistoryItem(scenesByPerformer)}
                                                    />
                                                }

                                                {/* start video logic for interactive scenes */}
                                                    { (this.checkIfScenesExist(scenesByPerformer) && this.isSceneHistInteractive(scenesByPerformer)) &&
                                                        <div>
                                                            <InteractiveScenePlayer evaluation={this.props.value.eval}
                                                                sceneVidLink={this.getVideoFileName(scenesByPerformer, "_visual")}
                                                                topDownLink={this.getVideoFileName(scenesByPerformer, "_topdown")}
                                                                sceneHistoryItem={this.getSceneHistoryItem(scenesByPerformer)}/>
                                                            <div className="scene-text">Links for other videos:</div>
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_depth")} target="_blank" rel="noopener noreferrer">Depth</a>
                                                            </div>
                                                            {this.state.currentMetadataLevel !== "" && this.state.currentMetadataLevel !== "level1" && 
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_segmentation")} target="_blank" rel="noopener noreferrer">Segmentation</a>
                                                            </div>} 
                                                        </div>
                                                    }
                                                {/* end video logic for interactive scenes */}
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