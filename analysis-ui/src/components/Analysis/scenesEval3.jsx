import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import $ from 'jquery';
//import FlagCheckboxMutation from './flagCheckboxMutation';
import {EvalConstants} from './evalConstants';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";

const historyQueryName = "createComplexQuery";
const historyQueryResults = "results";
const sceneQueryName = "getEval3Scene";

let constantsObject = {};
//let currentState = {};
let currentStep = 0;
let currentTime = 0;

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

// TODO: UPDATE
const mcs_scene= gql`
    query getEval3Scene($sceneName: String, $testNum: Int){
        getEval3Scene(sceneName: $sceneName, testNum: $testNum) {
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

function getSorting(order, orderBy) {
    return order === "desc"
    ? (a, b) => (_.get(a, orderBy) > _.get(b, orderBy) ? -1 : 1)
    : (a, b) => (_.get(a, orderBy) < _.get(b, orderBy) ? -1 : 1);
}

const scoreTableCols = [
    { dataKey: 'scene_num', title: 'Scene' },
    { dataKey: 'scene_goal_id', title: 'Goal ID'},
    { dataKey: 'scene.goal.sceneInfo.slices', title: 'Slices'},
    { dataKey: 'score.classification', title: 'Classification' },
    { dataKey: 'score.score_description', title: 'Score'},
    { dataKey: 'score.confidence', title: 'Confidence' }
]
// TODO: Merge back in with Scenes view?
class ScenesEval3 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentMetadataLevel: props.value.metadata_lvl !== undefined ? props.value.metadata_lvl : "",
            currentSceneNum: (props.value.scene !== undefined && props.value.scene !== null) ? parseInt(props.value.scene) : 1,
            currentObjectNum: 0,
            //flagRemove: false,
            //flagInterest: false,
            testType: props.value.test_type,
            categoryType: props.value.category_type,
            testNum: props.value.test_num,
            sortBy: "",
            sortOrder: "asc",
            showInternalState: false
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

    displayItemText(row, dataKey) {
        let item = _.get(row, dataKey);

        if(item !== undefined && item !== null && item !== "") {
            return this.convertValueToString(item);
        } else {
            return "";
        }
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
        let currentTimeNum = document.getElementById("interactiveMoviePlayer").currentTime;
        if(currentTimeNum !== currentTime) {
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
            currentTime = currentTimeNum;
            currentStep = Math.floor(currentTimeNum * 20);
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

    goToVideoLocation = (currentAction) => {
        // videos for eval 3 are faster than eval 2 -- 20 actions/frames per second
        let timeToJumpTo = (currentAction + 1) / 20;

        if( document.getElementById("interactiveMoviePlayer") !== null) {
            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
            currentStep = currentAction;
            currentTime = timeToJumpTo;
            document.getElementById("interactiveMoviePlayer").currentTime = currentTime;

            $('#stepHolder' + currentStep ).toggleClass( "step-highlight" );
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

    toggleShowInternalState = (newValue) => {
        this.setState({
            showInternalState: newValue
        });
    }

    showInternalStatePreview = (stepObj) => {
        if(!_.isEmpty(stepObj.internal_state)) {
            return JSON.stringify(stepObj.internal_state).substring(0, 20) + '...';

        } else {
            return JSON.stringify(stepObj.internal_state);
        }
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
        if(scenesByPerformer !== undefined && scenesByPerformer !== null) {
            let sceneNumAsString = this.state.currentSceneNum.toString();
            return scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer][sceneNumAsString];
        }
    }

    getVideoFileName = (scenesByPerformer, videoCategory) => {
        let sceneItem = this.getSceneHistoryItem(scenesByPerformer);

        if(sceneItem !== undefined && sceneItem !== null) {
            return constantsObject["moviesBucket"] +
                sceneItem.filename +
                videoCategory +
                sceneItem.fileTimestamp +
                constantsObject["movieExtension"];
        } else  {
            return "";
        }
    }

    convertXYArrayToString = (arrayToConvert) => {
        let newStr = "";
        for(let i=0; i < arrayToConvert.length; i++) {
            newStr = newStr + '(' + this.convertValueToString(arrayToConvert[i]) + ')';

            if(i < arrayToConvert.length -1) {
                newStr = newStr + ", ";
            }
        }

        return newStr;
    }

    handleRequestSort = (property) => {
        let isAsc = this.state.sortBy === property && this.state.sortOrder === 'asc';

        this.setState({ 
            sortOrder: (isAsc ? 'desc' : 'asc'), 
            sortBy: property 
        });
    };

    // currentSceneNum is used for the map values in scenesByPerformer
    // need to subtract 1 to use as array index in scenesInOrder
    getCurrentScene = (scenesInOrder) => {
        return scenesInOrder[this.state.currentSceneNum - 1];
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
                onCompleted={() => {if(this.props.value.scene === null) { this.changeScene(1); }}}>
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
                                    this.initializeStepView();

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
                                                                <video src={this.getVideoFileName(scenesByPerformer, "_visual_")} width="600" height="400" controls="controls" autoPlay={false} />
                                                            </div>
                                                            <div>
                                                                <div><b>Top Down Plot</b></div>
                                                                <video src={this.getVideoFileName(scenesByPerformer, "_topdown_")} width="600" height="400" controls="controls" autoPlay={false} />
                                                            </div>
                                                        </div>

                                                        <div className="scene-text">Links for other videos:</div>
                                                            <div className="scene-text">
                                                                <a href={
                                                                    this.getVideoFileName(scenesByPerformer, "_heatmap_")} target="_blank" rel="noopener noreferrer">Heatmap</a>
                                                            </div>
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_depth_")} target="_blank" rel="noopener noreferrer">Depth</a>
                                                            </div>
                                                            {this.state.currentMetadataLevel !== "" && this.state.currentMetadataLevel !== "level1" && 
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_segmentation_")} target="_blank" rel="noopener noreferrer">Segmentation</a>
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

                                                <div className="score-table-div">
                                                    <Table className="score-table" aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                            {scoreTableCols.map((col, colKey) => (
                                                                <TableCell key={"performer_score_header_cell_" + colKey}>
                                                                    <TableSortLabel active={this.state.sortBy === col.dataKey} direction={this.state.sortOrder} 
                                                                        onClick={() => this.handleRequestSort(col.dataKey)}>
                                                                        {col.title}
                                                                    </TableSortLabel>
                                                                </TableCell>
                                                            ))}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                        {this.checkIfScenesExist(scenesByPerformer) && _.values(scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer]).sort(getSorting(this.state.sortOrder, this.state.sortBy)).map((scoreObj, rowKey) => 
                                                            <TableRow key={'performer_score_row_' + rowKey}>
                                                                {scoreTableCols.map((col, colKey) => (
                                                                    <TableCell key={"performer_score_row_" + rowKey + "_col_" + colKey}>
                                                                        {(col.dataKey === "scene_num") &&
                                                                            <button key={"scene_button_" + scoreObj.scene_num} 
                                                                                className={this.state.currentSceneNum === scoreObj.scene_num ? 'btn btn-primary active' : 'btn btn-secondary'}
                                                                                id={"scene_btn_" + scoreObj.scene_num} type="button" onClick={() => this.changeScene(scoreObj.scene_num)}>
                                                                                    Scene {scoreObj.scene_num}
                                                                            </button>
                                                                        }

                                                                        {(col.dataKey !== "scene_num") &&
                                                                            this.displayItemText(scoreObj, col.dataKey)
                                                                        }
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        )}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                { (this.checkIfScenesExist(scenesByPerformer) && this.getSceneHistoryItem(scenesByPerformer) !== undefined && this.getSceneHistoryItem(scenesByPerformer)["category"] !== "interactive") && 
                                                    <div className="classification-by-step">
                                                        <Accordion defaultActiveKey="0">
                                                            <Card>
                                                                <Accordion.Toggle as={Card.Header} className="classification-by-step-header" eventKey="0">
                                                                    <div>
                                                                        <div>
                                                                            <h3>Selected Scene Classification by Step</h3>
                                                                        </div>
                                                                        <div>
                                                                            <h6>(Click Here to Expand/Collapse)</h6>
                                                                        </div>
                                                                    </div>
                                                                </Accordion.Toggle>
                                                                <Accordion.Collapse eventKey="0">
                                                                    <Card.Body>
                                                                        <div className="score-table-div">
                                                                            <table className="score-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Step Number</th>
                                                                                        <th>Action</th>
                                                                                        <th>Classification</th>
                                                                                        <th>Confidence</th>
                                                                                        <th>Violations ((x,y) list)</th>
                                                                                        {this.props.value.eval !== "Evaluation 3 Results" &&
                                                                                            <th>Internal State
                                                                                                <br/>
                                                                                                <span className={this.state.showInternalState ? "internal-state-toggle" : "display-none"} onClick={() => this.toggleShowInternalState(false)}>(Click to Collapse)</span>
                                                                                                <span className={this.state.showInternalState ? "display-none" : "internal-state-toggle"} onClick={() => this.toggleShowInternalState(true)}>(Click to Expand)</span>
                                                                                            </th>
                                                                                        }
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {this.getSceneHistoryItem(scenesByPerformer) !== undefined && this.getSceneHistoryItem(scenesByPerformer) !== null
                                                                                        && this.getSceneHistoryItem(scenesByPerformer).steps.map((stepObj, key) => 
                                                                                        <tr key={'performer_classification_by_step_row_' + key}>
                                                                                            <td>{stepObj.stepNumber}</td>
                                                                                            <td>{stepObj.action}</td>
                                                                                            <td>{stepObj.classification}</td>
                                                                                            <td>{stepObj.confidence}</td>
                                                                                            <td>
                                                                                                {stepObj.action !== 'EndHabituation' && stepObj.violations_xy_list !== undefined
                                                                                                && stepObj.violations_xy_list !== null &&
                                                                                                        this.convertXYArrayToString(stepObj.violations_xy_list)                                                                     
                                                                                                }
                                                                                            </td>
                                                                                            {this.props.value.eval !== "Evaluation 3 Results" && 
                                                                                                <td className="internal-state-cell">
                                                                                                    <span className={this.state.showInternalState ? "" : "display-none"}>
                                                                                                        {JSON.stringify(stepObj.internal_state)}
                                                                                                    </span>
                                                                                                    <span className={this.state.showInternalState ? "display-none" : ""}>
                                                                                                        {this.showInternalStatePreview(stepObj)}
                                                                                                    </span>
                                                                                                </td>
                                                                                            }
                                                                                        </tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>                            
                                                                    </Card.Body>
                                                                </Accordion.Collapse>
                                                            </Card>
                                                        </Accordion>
                                                    </div>
                                                }

                                                <div className="scenes_header">
                                                    <h3>View Selected Scene Info</h3>
                                                </div>
                                                    { (this.checkIfScenesExist(scenesByPerformer) && this.getSceneHistoryItem(scenesByPerformer) !== undefined && this.getSceneHistoryItem(scenesByPerformer)["category"] === "interactive") &&
                                                        <div>
                                                            <div className="movie-steps-holder">
                                                                <div className="interactive-movie-holder">
                                                                    <video id="interactiveMoviePlayer" src={
                                                                        this.getVideoFileName(scenesByPerformer, "_visual_")} width="500" height="350" controls="controls" autoPlay={false} onTimeUpdate={this.highlightStep}/>
                                                                </div>
                                                                <div className="steps-holder">
                                                                    <h5>Performer Steps:</h5>
                                                                    <div className="steps-container">
                                                                            <div id="stepHolder0" className="step-div step-highlight" onClick={() => this.goToVideoLocation(0)}>0: Starting Position</div>
                                                                            {this.getSceneHistoryItem(scenesByPerformer).steps.map((stepObject, key) => 
                                                                            <div key={"step_div_" + key} id={"stepHolder" + (key+1)} className="step-div" onClick={() => this.goToVideoLocation(key+1)}>
                                                                                {stepObject.stepNumber + ": " + stepObject.action + " (" + this.convertValueToString(stepObject.args) + ") - " + stepObject.output.return_status}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="top-down-holder">
                                                                    <video id="interactiveMoviePlayer" src={
                                                                        this.getVideoFileName(scenesByPerformer, "_topdown_")} width="500" height="350" controls="controls" autoPlay={false}/>
                                                                </div>
                                                            </div>
                                                            <div className="scene-text">Links for other videos:</div>
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_depth_")} target="_blank" rel="noopener noreferrer">Depth</a>
                                                            </div>
                                                            {this.state.currentMetadataLevel !== "" && this.state.currentMetadataLevel !== "level1" && 
                                                            <div className="scene-text">
                                                                <a href={this.getVideoFileName(scenesByPerformer, "_segmentation_")} target="_blank" rel="noopener noreferrer">Segmentation</a>
                                                            </div>} 
                                                        </div>
                                                    }
                                                {scenesInOrder && this.state.currentSceneNum <= scenesInOrder.length && this.getCurrentScene(scenesInOrder) !== undefined
                                                    && this.getCurrentScene(scenesInOrder) !== null &&
                                                    <div className="scene-table-div">
                                                        <table>
                                                            <tbody>
                                                                {Object.keys(this.getCurrentScene(scenesInOrder)).map((objectKey, key) => 
                                                                    this.checkSceneObjectKey(this.getCurrentScene(scenesInOrder), objectKey, key))}
                                                            </tbody>
                                                        </table>
                                                        {this.getCurrentScene(scenesInOrder).objects && this.getCurrentScene(scenesInOrder).objects.length > 0 &&
                                                            <>
                                                                <div className="objects_scenes_header">
                                                                    <h5>Objects in Scene</h5>
                                                                </div>
                                                                <div className="object-nav">
                                                                    <ul className="nav nav-tabs">
                                                                        {this.getCurrentScene(scenesInOrder).objects.map((sceneObject, key) => 
                                                                            <li className="nav-item" key={'object_tab_' + key}>
                                                                                <button id={'object_button_' + key} className={key === 0 ? 'nav-link active' : 'nav-link'} onClick={() => this.changeObjectDisplay(key)}>{this.findObjectTabName(sceneObject)}</button>
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                                <div className="object-contents">
                                                                    <table>
                                                                        <tbody>
                                                                            {Object.keys(this.getCurrentScene(scenesInOrder).objects[this.state.currentObjectNum]).map((objectKey, key) => 
                                                                                <tr key={'object_tab_' + key}>
                                                                                    <td className="bold-label">{objectKey}:</td>
                                                                                    <td className="scene-text">{this.convertValueToString(this.getCurrentScene(scenesInOrder).objects[this.state.currentObjectNum][objectKey])}</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div> 
                                                            </>   
                                                        }    
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

export default ScenesEval3;