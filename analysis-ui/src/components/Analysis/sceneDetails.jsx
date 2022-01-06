import React, {useState} from 'react';
import $ from 'jquery';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import { convertValueToString } from './displayTextUtils';

function SceneDetailsModal({show, onHide, currentSceneNum, currentScene, constantsObject}) {
    
    const [currentObjectNum, setCurrentObjectNum] = useState(0);
    const [selectedData, setSelectedData] = useState("scene_info");
    const keysToIgnore = ['objects', 'goal', 'objectsInfo'];

    const closeModal = () => {
        onHide();
        setCurrentObjectNum(0);
        setSelectedData("scene_info");
    }

    const checkSceneObjectKey = (scene, objectKey, key, labelPrefix = "") => {
        if(!keysToIgnore.includes(objectKey)) {
            return (
                <tr key={'scene_prop_' + key}>
                    <td className="bold-label">{labelPrefix + objectKey}:</td>
                    <td className="scene-text">{convertValueToString(scene[objectKey])}</td>
                </tr>
            );
        } else if(objectKey === 'goal') {
            return (
                Object.keys(scene["goal"]).map((goalObjectKey, goalKey) => 
                    checkSceneObjectKey(scene["goal"], goalObjectKey, goalKey, "goal."))
            );
        }
    }

    const findObjectTabName = (sceneObject) => {
        if(sceneObject.shape !== undefined && sceneObject.shape !== null) {
            return sceneObject.shape;
        }

        if(sceneObject.id.indexOf('occluder_wall') > -1) {
            return "occluder wall";
        }

        if(sceneObject.id.indexOf('occluder_pole') > -1) {
            return "occluder pole";
        }

        if(sceneObject.role !== undefined && sceneObject.role !== null) {
            return sceneObject.role;
        }

        return sceneObject.type;
    }

    const changeObjectDisplay = (objectKey) => {
        $('#object_button_' + currentObjectNum ).toggleClass( "active" );
        $('#object_button_' + objectKey ).toggleClass( "active" );

        setCurrentObjectNum(objectKey);
    }

    const getSceneLink = (currentScene) => {
        let sceneName = currentScene.name;

        if(currentScene.eval !== undefined && currentScene.eval === "Evaluation 3.75 Scenes") {
            sceneName =  currentScene.name.replace("juliett", "juliett_rerun")
        }

        if(currentScene.eval !== undefined && currentScene.eval === "Evaluation 4 Scenes"
            && currentScene.goal.category !== 'agents') {
            // Goal ID is part of debug file names for Eval 4
            sceneName = sceneName.concat("_", currentScene.goal.sceneInfo.id[0])
        }

        return constantsObject["sceneBucket"] + sceneName + constantsObject["sceneExtension"]
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered scrollable={true}>
            <Modal.Header closeButton>
                <div className="scene-details-header">
                    <div className="scene-title-and-download">
                        <Modal.Title>
                            Scene {currentSceneNum} Details 
                        </Modal.Title>

                        {currentScene !== undefined && currentScene !== null &&
                        <div className="download-scene">
                            <a href={getSceneLink(currentScene)} download target="_blank" rel="noopener noreferrer">
                                <i className='material-icons'>get_app</i>
                                <span className="download-scene-text">Right Click to Download .JSON</span>
                            </a>
                        </div>}
                    </div>

                    <div className="scene-details-btn-group btn-group" role="group">
                        <button className={"scene_info" === selectedData ? 'btn btn-primary active' : 'btn btn-secondary'}
                            id='toggle_data_scene_info' key='toggle_scene_info' type="button"
                            onClick={() => setSelectedData("scene_info")}>
                                Scene Details
                        </button>
                        <button className={"scene_objects" === selectedData ? 'btn btn-primary active' : 'btn btn-secondary'}
                            id='toggle_data_scene_objects' key='toggle_scene_objects' type="button"
                            onClick={() => setSelectedData("scene_objects")}>
                                Objects In Scene
                        </button>
                    </div>  
                </div>
            </Modal.Header>
            <Modal.Body>
                {currentScene !== undefined
                    && currentScene !== null &&
                    <div className="scene-table-div">
                        <table className={"scene_info" !== selectedData ? "display-none" : ""}>
                            <tbody>
                                {Object.keys(currentScene).map((objectKey, key) => 
                                    checkSceneObjectKey(currentScene, objectKey, key))}
                            </tbody>
                        </table>

                        {currentScene.objects && currentScene.objects.length > 0 &&
                            <div className={"scene_objects" !== selectedData ? "display-none" : ""}>
                                <div className="object-nav">
                                    <ul className="nav nav-tabs">
                                        {currentScene.objects.map((sceneObject, key) => 
                                            <li className="nav-item" key={'object_tab_' + key}>
                                                <button id={'object_button_' + key} className={key === currentObjectNum ? 'nav-link active' : 'nav-link'} onClick={() => changeObjectDisplay(key)}>{findObjectTabName(sceneObject)}</button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="object-contents">
                                    <table>
                                        <tbody>
                                            { Object.keys(currentScene.objects[currentObjectNum]).map((objectKey, key) => 
                                                <tr key={'object_tab_' + key}>
                                                    <td className="bold-label">{objectKey}:</td>
                                                    <td className="scene-text">{convertValueToString(currentScene.objects[currentObjectNum][objectKey])}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div> 
                            </div>   
                        }    
                    </div>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={closeModal}>Close Details</Button>
            </Modal.Footer>
        </Modal>
    );
}

function SceneDetails ({currentSceneNum, currentScene, constantsObject}) {

    const [modalShow, setModalShow] = useState(false);

    return (
        <>
            <div className="show-details-toggle" onClick={() => setModalShow(true)}>
                <i className='material-icons'>fullscreen</i>
            </div>

            <SceneDetailsModal
                show = {modalShow}
                onHide = {() => setModalShow(false)}
                currentSceneNum={currentSceneNum}
                currentScene={currentScene}
                constantsObject={constantsObject}
            />
        </>
    );
    
}

export default SceneDetails;