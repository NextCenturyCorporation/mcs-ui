import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'

function ScoreCardModal({show, onHide, scorecardObject, currentSceneNum}) {

    const closeModal = () => {
        onHide();
    }

    const cleanupKeyString = (keyString) => {
        return(keyString.toLowerCase().split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' '));
    }

    const isValueNonNullObject = (scorecardObject, key) => {
        return scorecardObject[key] !== null && typeof scorecardObject[key] == 'object';
    }

    const printValue = (scorecardObject) => {
        if(scorecardObject === null) {
            return "N/A";
        } else {
            return scorecardObject;
        }
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered scrollable={true}>
            <Modal.Header closeButton>
                <div className="scene-details-header">
                    <div className="scene-title-and-download">
                        <Modal.Title>
                            Scorecard - Scene {currentSceneNum}
                        </Modal.Title>
                    </div>  
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="scene-table-div">
                    {scorecardObject !== undefined && Object.keys(scorecardObject).map((objectKey, key) => 
                        <>
                            {isValueNonNullObject(scorecardObject, objectKey) &&
                                <>
                                    {Object.keys(scorecardObject[objectKey]).length > 0 &&
                                        <>
                                            <div key={"scorecard_row_" + key}>{cleanupKeyString(objectKey) + ": "}</div>
                                            <ul>
                                                {scorecardObject[objectKey] !== undefined && scorecardObject[objectKey] !== null && Object.keys(scorecardObject[objectKey]).map((subObjKey, subKey) => 
                                                    <li key={"scorecard_sub_row_" + subKey}>{cleanupKeyString(subObjKey) + ": " + printValue(scorecardObject[objectKey][subObjKey])}</li>
                                                )}
                                            </ul>
                                        </>
                                    }

                                    {Object.keys(scorecardObject[objectKey]).length === 0 &&
                                        <div className="single-scorecard-item" key={"scorecard_row_" + key}>{cleanupKeyString(objectKey) + ": N/A"}</div>
                                    }
                                </>
                            }
                            {(!isValueNonNullObject(scorecardObject, objectKey)) &&
                                <>
                                    <div className="single-scorecard-item" key={"scorecard_row_" + key}>
                                        {cleanupKeyString(objectKey) + ": " + printValue(scorecardObject[objectKey])}
                                    </div>
                                </>
                            }
                        </>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={closeModal}>Close Details</Button>
            </Modal.Footer>
        </Modal>
    );
}

function Scorecard ({scorecardObject, currentSceneNum}) {

    const [modalShow, setModalShow] = useState(false);

    return (
        <>
            <div className="show-details-toggle" onClick={() => setModalShow(true)}>
                <i className='material-icons'>fullscreen</i>
            </div>

            <ScoreCardModal
                show = {modalShow}
                onHide = {() => setModalShow(false)}
                scorecardObject={scorecardObject}
                currentSceneNum={currentSceneNum}
            />
        </>
    );
    
}

export default Scorecard;