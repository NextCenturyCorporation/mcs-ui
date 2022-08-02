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
import PlaybackButtons from './playbackButtons'
import PlausabilityGraph from './plausabilityGraph';
import ToggleItem from './toggleItem';

const historyQueryName = "getEvalHistory";
const sceneQueryName = "getEvalScene";

let constantsObject = {};
//let currentState = {};

const mcs_scene= gql`
    query getEvalScene($eval: String, $sceneName: String, $testNum: Int){
        getEvalScene(eval: $eval, sceneName: $sceneName, testNum: $testNum) {
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


const mcs_history = gql`
    query getEvalHistory($eval: String, $categoryType: String, $testNum: Int){
        getEvalHistory(eval: $eval, categoryType: $categoryType, testNum: $testNum) {
            eval
            performer
            name
            test_type
            test_num
            scene_num
            scene_goal_id
            score
            slices
            steps
            flags
            metadata
            step_counter
            category
            category_type
            category_pair
            fullFilename
            filename
            fileTimestamp
            corner_visit_order
        }
    }`;

const setConstants = function(evalNum) {
    constantsObject = EvalConstants[evalNum];
}

const scoreTableColsPassive = [
    { dataKey: 'scene_num', title: 'Scene'},
    { dataKey: 'scene_goal_id', title: 'Goal ID'},
    { dataKey: 'slices', title: 'Slices'},
    { dataKey: 'score.classification', title: 'Rating/Classification'},
    { dataKey: 'score.score_description', title: 'Evaluation Score'},
    { dataKey: 'score.confidence', title: 'Score/Confidence'}
]

const scoreTableColsInteractive = [
    { dataKey: 'scene_num', title: 'Scene'},
    { dataKey: 'scene_goal_id', title: 'Goal ID'},
    { dataKey: 'slices', title: 'Slices'},
    { dataKey: 'score.score_description', title: 'Evaluation Score'}
]

const scoreTableColsWithCorners = scoreTableColsInteractive.concat([{ dataKey: 'corner_visit_order', title: 'Corner Visit Order'}])

// local storage property identifiers
const plausibilityLSPropName = "showPlausabilityGraph";
const segmentationLSPropName = "showSegmentationVid";
const depthMapLSPropName = "showDepthMapVid";

const getLocalStorageProp = function(propName, defaultVal) {
    return window.localStorage.getItem(propName) !== null ? JSON.parse(window.localStorage.getItem(propName)) : defaultVal;
}

class Scenes extends React.Component {

    constructor(props) {
        super(props);
        this.playBackButtons = React.createRef();
        this.state = {
            currentPerformer: props.value.performer !== undefined ? props.value.performer : "",
            currentMetadataLevel: props.value.metadata_lvl !== undefined ? props.value.metadata_lvl : "",
            currentSceneNum: (props.value.scene !== undefined && props.value.scene !== null) ? parseInt(props.value.scene) : 1,
            //flagRemove: false,
            //flagInterest: false,
            testType: props.value.test_type,
            categoryType: props.value.category_type,
            testNum: props.value.test_num,
            playAll: false,
            syncVideos: false,
            speed: "1x",
            sceneViewLoaded: false,
            topDownLoaded: false,
            depthLoaded: false,
            segLoaded: false,
            showPlausabilityGraph: getLocalStorageProp(plausibilityLSPropName, true),
            showSegmentationVid: getLocalStorageProp(segmentationLSPropName, false),
            showDepthMapVid: getLocalStorageProp(depthMapLSPropName, false)
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

    changeScene = (sceneNum, matchSpeed=false, downOneOrUpOneScene=false) => {
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
            let sceneRow = document.getElementById("score_table_row_scene_" + sceneNum);
            if (sceneRow !== null && downOneOrUpOneScene) {
                let currentScrollPosition = document.documentElement.scrollTop;
                sceneRow.classList.toggle('analysis-table-selected-row');
                sceneRow.scrollIntoView({block: 'start'});
                sceneRow.classList.toggle('analysis-table-selected-row');
                document.documentElement.scrollTop = currentScrollPosition;
            }
            this.props.updateHandler("scene", sceneNum);
            this.resetVideoState(matchSpeed);
        }
    }

    resetVideoState = (matchSpeed) => {
        this.resetPlaybackButtons();

        if(matchSpeed) 
            this.setSceneSpeed(this.state.speed)
        if(!matchSpeed) {
            this.setState({playAll:false})
            this.setSceneSpeed("1x");
        }

        this.setState({sceneViewLoaded:false})
        this.setState({topDownLoaded:false})
        this.setState({depthLoaded:false})
        this.setState({segLoaded:false})
    }

    resetPlaybackButtons = () => {
        if(this.playBackButtons.current!==null)
            this.playBackButtons.current.reset();
    }

    setSceneSpeed = speed => {
        this.setState({speed:speed})
    }

    setSyncVideos = (value) => {
        this.setState({syncVideos: value});
    }

    upOneScene = () => {
        if(this.state.currentSceneNum-1 > 0)
            this.changeScene(this.state.currentSceneNum-1, false, true);
    }

    downOneScene = (numOfScenes, checkState) => {
        if((checkState && this.state.playAll) || !checkState) {
            if (this.state.currentSceneNum < numOfScenes) {
                this.changeScene(this.state.currentSceneNum+1, true, true);
            }
        }
    }

    onPlaybackEnded = (numScenes, checkState) => {
        this.downOneScene(numScenes, checkState);
        if(this.state.syncVideos && ((!this.state.playAll) || this.state.currentSceneNum === numScenes)) {
            this.setSyncVideos(false);
        }
    }

    playAll = () => {
        this.setState({playAll:!this.state.playAll}, () => {
            const selectedColor = "#99d6ff"
            document.getElementById("playAllButton").style.background = this.state.playAll ? selectedColor : "white";
        });
    }
    
    setVideoSpeedAndPlay = () => {
        let checkSegLoaded = this.state[segmentationLSPropName] === true && this.isNotLevel1();
        let checkDepthLoaded = this.state[depthMapLSPropName] === true;

        if(this.state.sceneViewLoaded && this.state.topDownLoaded &&
            ((!checkSegLoaded) || (checkSegLoaded && this.state.segLoaded)) && 
            ((!checkDepthLoaded) || (checkDepthLoaded && this.state.depthLoaded))) {
            let topDownVideo = document.getElementById("topDownInteractiveMoviePlayer");
            let sceneVideo = document.getElementById("interactiveMoviePlayer");

            // optionally displayed videos:
            let depthVideo = document.getElementById("depthMoviePlayer");
            let segVideo = document.getElementById("segmentationMoviePlayer");

            let playbackRate = this.state.speed.slice(0, -1);

            sceneVideo.playbackRate = playbackRate
            topDownVideo.playbackRate = playbackRate

            if(depthVideo !== null) {
                depthVideo.playbackRate = playbackRate;
            }

            if(segVideo !== null) {
                segVideo.playbackRate = playbackRate;
            }

            if(this.state.playAll) {
                topDownVideo.play();
                sceneVideo.play();

                if(depthVideo !== null) {
                    depthVideo.play();
                }

                if(segVideo !== null) {
                    segVideo.play();
                }
            }
        }
    }

    setSceneViewLoaded = () => {
        this.setState({sceneViewLoaded:true}, ()=> {
            this.setVideoSpeedAndPlay();
        });
    }

    setTopDownLoaded = () => {
        this.setState({topDownLoaded:true}, ()=> {
            this.setVideoSpeedAndPlay();
        });
    }

    setDepthLoaded = () => {
        this.setState({depthLoaded:true}, ()=> {
            this.setVideoSpeedAndPlay();
        });
    }

    setSegLoaded = () => {
        this.setState({segLoaded:true}, ()=> {
            this.setVideoSpeedAndPlay();
        });
    }

    getSceneNamePrefix = (name) => {
        let secondToLastIndex = name.lastIndexOf('_', name.lastIndexOf('_')-1)

        return name.substring(0, secondToLastIndex) + '*';
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
        if(this.state.syncVideos === true) {
            this.resetPlaybackButtons();
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

    isSceneHistPassive = (scenesByPerformer) => {
        return this.getSceneHistoryItem(scenesByPerformer) !== undefined &&
            this.getSceneHistoryItem(scenesByPerformer)["category"] === "passive"
    }

    getPointsData(sceneHistItem) {
        let data = [];

        sceneHistItem.steps.forEach(step => {
            let plausibility = step["confidence"];

            // For pre-eval 4 VoE data, flip confidence value since we 
            // had a lot of "implausible: 1" instead of "0".
            if(this.isPreEval4(sceneHistItem.eval) && step["classification"] === "implausible") {
                plausibility = 1 - step["confidence"];
            }

            // It was decided during planning for Eval 4 that agency scenes do not 
            // require confidence/score value, just a classification/rating
            if(sceneHistItem["test_type"] === "agents") {
                // For pre-eval 4 agent data, just use 0/1 values (for unexpected/expected)
                // if we want to represent them in this graph
                if(this.isPreEval4(sceneHistItem.eval)) {
                    if(step["classification"] === "expected") {
                        plausibility = 1;
                    } else if(step["classification"] === "unexpected") {
                        plausibility = 0;
                    } else {
                        plausibility = null;
                    }
                } else {
                    // Eval 4+ should have a value between 0.0 and 1.0 in the 
                    // classification field
                    plausibility = step["classification"];
                }

            }

            data.push({y: plausibility, x: step["stepNumber"]})
        });

        let points = [
            {id: "Scene " + sceneHistItem.scene_num, color: "hsla(50, 70%, 50%, 0)", data: data}
        ];

        return points;
    
    }

    isPreEval4(evalResultName) {
        return ["Evaluation 3 Results",
                "Evaluation 3.5 Results",
                "Evaluation 3.75 Results"].indexOf(evalResultName) > -1;
    }

    getLogFileName = (scenesByPerformer) => {
        let sceneItem = this.getSceneHistoryItem(scenesByPerformer);
        if(sceneItem === undefined || sceneItem === null) {
            return "";
        }

        return constantsObject["moviesBucket"] +
            sceneItem.fullFilename +
            "_" + sceneItem.fileTimestamp +
            constantsObject["logExtension"];
    }

    togglePlausibilityGraph = (newValue) => {
        this.setStateObject(plausibilityLSPropName, newValue);   
    }

    toggleSegmentationVideo = (newValue) => {
        this.setStateObject(segmentationLSPropName, newValue);
        this.resetVideoState(false);
    }

    toggleDepthVideo = (newValue) => {
        this.setStateObject(depthMapLSPropName, newValue);
        this.resetVideoState(false);
    }

    isNotLevel1 = () => {
        return this.state.currentMetadataLevel !== "" && this.state.currentMetadataLevel !== 'level1';
    }

    getScoreTableCols = (isInteractive, categoryType) => {
        if(isInteractive) {
            if(categoryType === "reorientation") {
                return scoreTableColsWithCorners;
            } else {
                return scoreTableColsInteractive;
            }
        }
        return scoreTableColsPassive;
    }

    render() {
        return (
            <Query query={mcs_history} variables={
                {    
                    "eval": this.props.value.eval,
                    "categoryType": this.props.value.category_type, 
                    "testNum": parseInt(this.props.value.test_num)
                }}
                onCompleted={() => { if(this.props.value.scene === null) { this.changeScene(1); }}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const evals = data[historyQueryName];

                    let sortedScenes =  _.sortBy(evals, "scene_num");
                    let scenesByMetadata = _.groupBy(sortedScenes, "metadata");
                    let metadataList = Object.keys(scenesByMetadata);
                    let performerList = _.uniq(_.map(sortedScenes, "performer"));
                    performerList.sort((a, b) => (a > b) ? 1 : -1);

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
                                {"eval": this.props.value.eval,
                                "sceneName": sceneNamePrefix, 
                                "testNum": parseInt(this.props.value.test_num)
                                }}>
                            {
                                ({ loading, error, data }) => {
                                    if (loading) return <div>Loading ...</div> 
                                    if (error) return <div>Error</div>
                                    
                                    const scenes = data[sceneQueryName];
                                    const scenesInOrder = _.sortBy(scenes, "scene_num");
                                    const numOfScenes = scenesInOrder.length;

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
                                            <div className="scene-container">
                                                <div className="history-selector-sticky">
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

                                                    <div className="btn-group" role="group">
                                                        {(this.checkIfScenesExist(scenesByPerformer) && this.isSceneHistPassive(scenesByPerformer)) &&
                                                            <ToggleItem propertyName={plausibilityLSPropName} defaultValue={this.state[plausibilityLSPropName]} 
                                                                label="Plausability Graph" changeHandler={this.togglePlausibilityGraph}/>
                                                        }
                                                        {this.isNotLevel1() &&
                                                            <ToggleItem propertyName={segmentationLSPropName} defaultValue={this.state[segmentationLSPropName]}
                                                                label="Segmentation" changeHandler={this.toggleSegmentationVideo} toggleDisabled={this.state.syncVideos}/>
                                                        }
                                                        <ToggleItem propertyName={depthMapLSPropName} defaultValue={this.state[depthMapLSPropName]}
                                                            label="Depth" changeHandler={this.toggleDepthVideo} toggleDisabled={this.state.syncVideos}/>
                                                    </div>
                                                </div>
                                                { (this.checkIfScenesExist(scenesByPerformer) && this.isSceneHistPassive(scenesByPerformer)) && 
                                                    <div>
                                                        <div className="eval-movie-row">
                                                            <div>
                                                                <div><b>Scene:</b> {this.state.currentSceneNum}</div>
                                                                <video id="interactiveMoviePlayer" className="eval-movie" src={this.getVideoFileName(scenesByPerformer, "_visual")} width="525" height="350" controls="controls" 
                                                                    onEnded={() => this.onPlaybackEnded(numOfScenes, true)} onLoadedData={this.setSceneViewLoaded}/>
                                                            </div>
                                                            <div>
                                                                <div><b>Top Down Plot</b></div>
                                                                <video id="topDownInteractiveMoviePlayer" className="eval-movie" src={this.getVideoFileName(scenesByPerformer, "_topdown")} width="525" height="350" controls="controls" onLoadedData={this.setTopDownLoaded}/>
                                                            </div>

                                                            {this.state[plausibilityLSPropName] && <div>
                                                                <div className="graph-header"><b>Plausibility Graph</b></div>
                                                                    <PlausabilityGraph 
                                                                        pointsData={this.getPointsData(this.getSceneHistoryItem(scenesByPerformer))}
                                                                        xAxisMax={this.getSceneHistoryItem(scenesByPerformer).steps.length}/>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="eval-movie-row">
                                                            {this.state[depthMapLSPropName] &&
                                                                <div>
                                                                    <video id="depthMoviePlayer" className="eval-movie" src={this.getVideoFileName(scenesByPerformer, "_depth")}        width="525" height="350" controls="controls" onLoadedData={this.setDepthLoaded}/>
                                                                    <div><b>Depth</b></div>
                                                                </div>
                                                            }
                                                            {this.isNotLevel1() && this.state[segmentationLSPropName] &&
                                                                <div>
                                                                    <video id="segmentationMoviePlayer" className="eval-movie" src={this.getVideoFileName(scenesByPerformer, "_segmentation")} width="525" height="350" controls="controls" 
                                                                        onLoadedData={this.setSegLoaded}/>
                                                                    <div><b>Segmentation</b></div>
                                                                </div>
                                                            }
                                                        </div>
                                                        <div className="playback-btns-passive">
                                                            <PlaybackButtons ref={this.playBackButtons} upOneScene={this.upOneScene} downOneScene={this.downOneScene} numOfScenes={numOfScenes} setStateObject={this.setStateObject}
                                                                playAllState={this.state.playAll} playAll={this.playAll} setSceneSpeed={this.setSceneSpeed} speed={this.state.speed}
                                                                setSyncVideos={this.setSyncVideos}/>
                                                        </div>
                                                        { (!this.isPreEval4(this.getSceneHistoryItem(scenesByPerformer)["eval"])) &&
                                                            <div className="scene-text"><a href={
                                                                this.getLogFileName(scenesByPerformer)} target="_blank" rel="noopener noreferrer">View Log File</a></div>
                                                            }
                                                    </div> 
                                                }
                                                {/* start video logic for interactive scenes */}
                                                { (this.checkIfScenesExist(scenesByPerformer) && this.isSceneHistInteractive(scenesByPerformer)) &&
                                                        <div>
                                                            <InteractiveScenePlayer evaluation={this.props.value.eval}
                                                                sceneVidLink={this.getVideoFileName(scenesByPerformer, "_visual")}
                                                                topDownLink={this.getVideoFileName(scenesByPerformer, "_topdown")}
                                                                depthLink={this.getVideoFileName(scenesByPerformer, "_depth")}
                                                                segLink={this.getVideoFileName(scenesByPerformer, "_segmentation")}
                                                                sceneHistoryItem={this.getSceneHistoryItem(scenesByPerformer)}
                                                                ref={this.playBackButtons}
                                                                upOneScene={this.upOneScene}
                                                                downOneScene={this.downOneScene}
                                                                numOfScenes={numOfScenes}
                                                                playAll={this.playAll}
                                                                playAllState={this.state.playAll}
                                                                setSceneSpeed={this.setSceneSpeed}
                                                                setSceneViewLoaded={this.setSceneViewLoaded}
                                                                setTopDownLoaded={this.setTopDownLoaded}
                                                                speed={this.state.speed}
                                                                displayDepth={this.state[depthMapLSPropName]}
                                                                displaySeg={this.state[segmentationLSPropName]}
                                                                setDepthLoaded={this.setDepthLoaded}
                                                                setSegLoaded={this.setSegLoaded}
                                                                setSyncVideos={this.setSyncVideos}
                                                                onPlaybackEnded={this.onPlaybackEnded}
                                                                />
                                                            { (!this.isPreEval4(this.getSceneHistoryItem(scenesByPerformer)["eval"])) &&
                                                                <div className="scene-text"><a href={
                                                                    this.getLogFileName(scenesByPerformer)} target="_blank" rel="noopener noreferrer">View Log File</a></div>
                                                                }
                                                        </div>
                                                    }
                                                {/* end video logic for interactive scenes */}
                                                <div className="scores_header">
                                                    <h3>Scores</h3>
                                                </div>

                                                {this.checkIfScenesExist(scenesByPerformer) &&
                                                    <ScoreTable
                                                        columns={this.getScoreTableCols(this.isSceneHistInteractive(scenesByPerformer), this.props.value.category_type)}
                                                        currentPerformerScenes={scenesByPerformer[this.state.currentMetadataLevel][this.state.currentPerformer]}
                                                        currentSceneNum={this.state.currentSceneNum}
                                                        changeSceneHandler={this.changeScene}
                                                        scenesInOrder={scenesInOrder}
                                                        constantsObject={constantsObject}
                                                        sortable={true}
                                                        isInteractive={this.isSceneHistInteractive(scenesByPerformer)}
                                                    />
                                                }

                                                { (this.checkIfScenesExist(scenesByPerformer)) && 
                                                    <ClassificationByStepTable
                                                        evaluation={this.props.value.eval}
                                                        currentSceneHistItem={this.getSceneHistoryItem(scenesByPerformer)}
                                                        isInteractive={this.isSceneHistInteractive(scenesByPerformer)}
                                                    />
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
