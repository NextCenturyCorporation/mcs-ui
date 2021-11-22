import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'

function SceneDetailsModal({show, onHide, scorecardObject, currentSceneNum}) {

    const closeModal = () => {
        onHide();
    }

    const cleanupKeyString = (keyString) => {
        return(keyString.toLowerCase().split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' '));
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
                    {Object.keys(scorecardObject).map((objectKey, key) => 
                        <div key={"scorecard_row_" + key}>{cleanupKeyString(objectKey) + ": " + scorecardObject[objectKey]}</div>
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

            <SceneDetailsModal
                show = {modalShow}
                onHide = {() => setModalShow(false)}
                scorecardObject={scorecardObject}
                currentSceneNum={currentSceneNum}
            />
        </>
    );
    
}

export default Scorecard;