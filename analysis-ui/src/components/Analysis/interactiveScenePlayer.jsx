import React, {useState, useRef, useEffect} from 'react';
import { convertValueToString } from './displayTextUtils';
import PlaybackButtons from './playbackButtons';

const InteractiveScenePlayer = React.forwardRef(({evaluation, sceneVidLink, topDownLink, depthLink, segLink, sceneHistoryItem, 
    upOneScene, downOneScene, scenes, playAll, playAllState, setSceneSpeed, setTopDownLoaded, setSceneViewLoaded, speed,
    displayDepth, displaySeg, setDepthLoaded, setSegLoaded, setSyncVideos, onPlaybackEnded}, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const scenePlayer = useRef(null);
    const topDownPlayer = useRef(null);
    const depthPlayer = useRef(null);
    const segPlayer = useRef(null);
    const stepZero = useRef(null);
    const stepElems = useRef([]);
    const currentFPS = 20; // for eval 3+ videos

    useEffect( () => {
        if(sceneHistoryItem.steps !== undefined) {
            stepElems.current = new Array(sceneHistoryItem.steps);
        }
    }, [sceneHistoryItem.steps]);


    const goToVideoLocation = (location) => {
        if(location !== currentStep) {
            if(evaluation === "eval_2_results") {
                setCurrentStep(location);
                scenePlayer.current.currentTime = location;
            } else {
                // videos for eval 3+ are faster than eval 2 -- 20 actions/frames per second
                let timeToJumpTo = (location + 1) / currentFPS;
                setCurrentStep(location);
                setCurrentTime(timeToJumpTo);
                scenePlayer.current.currentTime = timeToJumpTo;
                topDownPlayer.current.currentTime = timeToJumpTo;

                if(depthPlayer.current !== null) {
                    depthPlayer.current.currentTime = timeToJumpTo;
                }

                if(segPlayer.current !== null) {
                    segPlayer.current.currentTime = timeToJumpTo;
                }
            }
        }
    }

    const highlightStep = (e) => {
        if(evaluation === "eval_2_results") {
            // For eval 2, first step is at 0.2 
            let currentTimeNum = Math.floor(scenePlayer.current.currentTime + 0.8);
            if(currentTimeNum !== currentStep) {
                setCurrentStep(currentTimeNum);
                scrollStepIntoView(currentStep);
            }
        } else {
            let currentTimeNum = scenePlayer.current.currentTime;
            if(currentTimeNum !== currentTime) {
                let newStep = Math.floor(currentTimeNum * currentFPS);
                setCurrentTime(currentTimeNum);
                setCurrentStep(newStep);
                scrollStepIntoView(newStep);
            }
        }
    }


    const initializeStepView = () => {
        setSceneViewLoaded();
        scrollStepIntoView(currentStep);
    }

    const scrollStepIntoView = (step) => {
        if(step === 0) {
            // step 0 has its own div/ref outside of stepElems since its not included in sceneHistoryItem.steps
            stepZero.current.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
        } else {
            // steps from sceneHistoryItem.steps
            let stepIndex = step - 1;

            if(stepElems.current[stepIndex] !== undefined && stepElems.current[stepIndex] !== null ) {
                stepElems.current[stepIndex].scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
            }
        }
    }

    const getStepsHolderHeight = () => {
        if(displayDepth || displaySeg) {
            return "700px"
        } else {
            return "350px"
        }
    }

    const getStepsCtrHeight = () => {
        if(displayDepth || displaySeg) {
            return "660px"
        } else {
            return "310px"
        }
    }

    return (
        <div>
            <div className="movie-steps-holder">
                <div className="video-column">
                    <div className="interactive-movie-holder">
                        <video id="interactiveMoviePlayer" className="interactive-vid" ref={scenePlayer}
                        src={sceneVidLink} controls="controls" onTimeUpdate={highlightStep} onLoadedData={initializeStepView} 
                        onEnded={() => onPlaybackEnded(scenes, true)}/>
                    </div>
                    {displayDepth &&
                        <div className="depth-holder">
                            <video id="depthMoviePlayer" className="interactive-vid" ref={depthPlayer} src={depthLink} controls="controls" onLoadedData={setDepthLoaded}/>
                        </div>
                    }
                </div>
                <div className="steps-holder" style={{height: getStepsHolderHeight()}}>
                    <h5>Performer Steps:</h5>
                    <div className="steps-container" style={{height: getStepsCtrHeight()}}>
                        <div id="stepHolder0" className={currentStep === 0 ? "step-div step-highlight" : "step-div"} ref={stepZero} onClick={() => goToVideoLocation(0)}>0: Starting Position</div>
                        {sceneHistoryItem !== undefined &&
                            sceneHistoryItem.steps.map((stepObject, key) => 
                            <div key={"step_div_" + key} id={"stepHolder" + (key+1)} ref = {element => stepElems.current[key] = element} className={currentStep === key+1 ? "step-div step-highlight" : "step-div"} onClick={() => goToVideoLocation(key+1)}>
                                {stepObject.stepNumber + ": " + stepObject.action + " (" + convertValueToString(stepObject.args) + ") - " + stepObject.output.return_status}
                            </div>
                        )}
                    </div>
                </div>
                <div className="video-column">
                    <div className="top-down-holder">
                        <video id="topDownInteractiveMoviePlayer" className="interactive-vid" ref={topDownPlayer} src={topDownLink} controls="controls" onLoadedData={setTopDownLoaded}/>
                    </div>
                    {displaySeg &&
                        <div className="segmentation-holder">
                            <video id="segmentationMoviePlayer" className="interactive-vid" ref={segPlayer} src={segLink} controls="controls" onLoadedData={setSegLoaded}/>
                        </div>
                    }
                </div>
            </div>
            <div className="playback-btns-interactive">
                <PlaybackButtons ref={ref} upOneScene={upOneScene} downOneScene={downOneScene} scenes={scenes} playAll={playAll} setSceneSpeed={setSceneSpeed} playAllState={playAllState} speed={speed} setSyncVideos={setSyncVideos}/>
            </div>
        </div>
    );
})

export default InteractiveScenePlayer;