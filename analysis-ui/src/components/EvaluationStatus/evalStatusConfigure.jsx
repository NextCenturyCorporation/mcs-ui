import React, {useState, useEffect} from 'react';
import gql from 'graphql-tag';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';
import cloneDeep from 'lodash/cloneDeep';

const SET_EVAL_PARAMETERS = gql`
    mutation setEvalStatusParameters($eval: String!, $evalStatusParams: JSON!){
        setEvalStatusParameters(eval: $eval, evalStatusParams: $evalStatusParams) 
  }`;

let tempStatusObj = {};

const EvalStatusConfigureModal = ({show, onHide, statusObj, testTypes, performers, metadatas, updateStatusObjHandler, evalName}) => {
    const [testType, setTestType] = useState();
    const [performer, setPerformer] = useState([]);
    const [metadata, setMetadata] = useState([]);
    const [saveParamsCall] = useMutation(SET_EVAL_PARAMETERS);

    const saveParams = () => {
        if(Object.keys(tempStatusObj).length === 0) {
            onHide();
            return;
        }

        saveParamsCall({ variables: { 
            eval: evalName,
            evalStatusParams: tempStatusObj
        } }).then(() => {
            tempStatusObj = {};
            updateStatusObjHandler();
            onHide();
        });

        onHide();
    };

    const addParams = () => {
        if(!testType)
            return;
        if(statusObj[testType.value] !== undefined) {
            statusObj[testType.value]["metadata"] = metadata;
            statusObj[testType.value]["performers"] = performer;
        } else {
            let testTypeObj = {
                label: testType.label,
                value: testType.value
            }
            testTypeObj["metadata"] = metadata;
            testTypeObj["performers"] = performer;
            
            statusObj[testType.value] = testTypeObj;
        }
        tempStatusObj = cloneDeep(statusObj);
    };

    const updatePerformersMetadata = (e) => {
        if(statusObj[e.value] !== undefined && statusObj[e.value].metadata !== null && statusObj[e.value].performers !== null) {
            setMetadata([...statusObj[e.value]["metadata"]]);
            setPerformer([...statusObj[e.value]["performers"]]);
        } else {
            setMetadata([]);
            setPerformer([]);
        }
    }

    const closeModal = () => {
        tempStatusObj = {};
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
                            onChange={e => { setTestType(e); updatePerformersMetadata(e) }}
                            options={testTypes}
                            placeholder="Select the test types..."
                        />
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Metadata:</div>
                        <Select
                            onChange={setMetadata}
                            options={metadatas}
                            placeholder="Select the metadata levels..."
                            value={metadata}
                            isMulti
                        />
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Performers:</div>
                        <Select
                            onChange={setPerformer}
                            options={performers}
                            placeholder="Select the performers..."
                            value={performer}
                            isMulti
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="secondary" onClick={addParams}>Add</Button>
                <Button variant="primary" onClick={saveParams}>Save Parameters</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EvalStatusConfigureModal;