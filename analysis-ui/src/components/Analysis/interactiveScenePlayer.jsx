import React, {useState, useRef, useEffect} from 'react';
import { convertValueToString } from './displayTextUtils';
import PlaybackButtons from './playbackButtons';

const InteractiveScenePlayer = React.forwardRef(({evaluation, sceneVidLink, topDownLink, sceneHistoryItem, upOneScene, downOneScene, numOfScenes, playAll, playAllState, setSceneSpeed, setTopDownLoaded, setSceneViewLoaded, speed, paddingLeft}, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const scenePlayer = useRef(null);
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
            if(evaluation === "Evaluation 2 Results") {
                setCurrentStep(location);
                scenePlayer.current.currentTime = location;
            } else {
                // videos for eval 3+ are faster than eval 2 -- 20 actions/frames per second
                let timeToJumpTo = (location + 1) / currentFPS;
                setCurrentStep(location);
                setCurrentTime(timeToJumpTo);
                scenePlayer.current.currentTime = timeToJumpTo;
            }
        }
    }

    const highlightStep = (e) => {
        if(evaluation === "Evaluation 2 Results") {
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
        setSceneViewLoaded()
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

    return (
        <div>
            <div className="movie-steps-holder">
                <div className="interactive-movie-holder">
                    <video id="interactiveMoviePlayer" ref={scenePlayer}
                    src={sceneVidLink} width="500" height="350" controls="controls" onTimeUpdate={highlightStep} onLoadedData={initializeStepView} 
                    onEnded={() => playAllState ? downOneScene(numOfScenes) : null}/>
                </div>
                <div className="steps-holder">
                    <h5>Performer Steps:</h5>
                    <div className="steps-container">
                        <div id="stepHolder0" className={currentStep === 0 ? "step-div step-highlight" : "step-div"} ref={stepZero} onClick={() => goToVideoLocation(0)}>0: Starting Position</div>
                        {sceneHistoryItem !== undefined &&
                            sceneHistoryItem.steps.map((stepObject, key) => 
                            <div key={"step_div_" + key} id={"stepHolder" + (key+1)} ref = {element => stepElems.current[key] = element} className={currentStep === key+1 ? "step-div step-highlight" : "step-div"} onClick={() => goToVideoLocation(key+1)}>
                                {stepObject.stepNumber + ": " + stepObject.action + " (" + convertValueToString(stepObject.args) + ") - " + stepObject.output.return_status}
                            </div>
                        )}
                    </div>
                </div>
                <div className="top-down-holder">
                    <video id="topDownInteractiveMoviePlayer" src={topDownLink} width="500" height="350" controls="controls" onLoadedData={setTopDownLoaded}/>
                </div>
            </div>
            <PlaybackButtons ref={ref} paddingLeft={paddingLeft} upOneScene={upOneScene} downOneScene={downOneScene} numOfScenes={numOfScenes} playAll={playAll} setSceneSpeed={setSceneSpeed} playAllState={playAllState} speed={speed}/>
        </div>
    );
})

export default InteractiveScenePlayer;