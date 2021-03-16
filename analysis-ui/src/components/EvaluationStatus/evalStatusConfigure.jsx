import React, {useState} from 'react';
import gql from 'graphql-tag';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';

const SET_EVAL_PARAMETERS = gql`
    mutation setEvalStatusParameters($eval: String!, $evalStatusParams: JSON!){
        setEvalStatusParameters(eval: $eval, evalStatusParams: $evalStatusParams) 
  }`;

function EvalStatusConfigureModal({show, onHide, statusObj, testTypes, performers, metadatas, updateStatusObjHandler, evalName}) {
    const [testType, setTestType] = useState(statusObj.testTypes);
    const [performer, setPerformer] = useState(statusObj.performers);
    const [metadata, setMetadata] = useState(statusObj.metadatas);
    const [saveParamsCall] = useMutation(SET_EVAL_PARAMETERS);

    const saveParams = () => {
        saveParamsCall({ variables: { 
            eval: evalName,
            evalStatusParams: {
                testTypes: testType,
                performers: performer,
                metadatas: metadata
            }
        } }).then(() => {
            updateStatusObjHandler();
            onHide();
        });

        onHide();
    };

    const closeModal = () => {
        onHide();
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Configure Parameters</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <div className="input-login-header">Test Types:</div>
                        <Select
                            onChange={setTestType}
                            options={testTypes}
                            placeholder="Select the test types..."
                            defaultValue={testType}
                            isMulti
                        />
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Performers:</div>
                        <Select
                            onChange={setPerformer}
                            options={performers}
                            placeholder="Select the performers..."
                            defaultValue={performer}
                            isMulti
                        />
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Metadata:</div>
                        <Select
                            onChange={setMetadata}
                            options={metadatas}
                            placeholder="Select the metadata levels..."
                            defaultValue={metadata}
                            isMulti
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="primary" onClick={saveParams}>Save Parameters</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EvalStatusConfigureModal;