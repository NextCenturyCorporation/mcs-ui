import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';
import gql from 'graphql-tag';

const SAVE_QUERY = gql`
    mutation saveQuery($user: JSON!, $queryObj: JSON!, $name: String!, $description: String!, $createdDate: Float!){
        saveQuery(user: $user, queryObj: $queryObj, name: $name, description: $description, createdDate: $createdDate) {
            name
        }
  }`;

function SaveQueryModal({show, onHide, queryObj, currentUser, queryId, updateQueryNameHandler}) {
    const [queryName, setQueryName] = useState("");
    const [queryDesc, setQueryDesc] = useState("");
    const [saveQueryCall] = useMutation(SAVE_QUERY);

    const resetSaveForm = () => {
        setQueryName("");
        setQueryDesc("");
    }

    const saveQuery = () => {
        saveQueryCall({ variables: { 
            user: currentUser,
            queryObj: queryObj,
            name: queryName,
            description: queryDesc,
            createdDate: (new Date()).valueOf()
        } });
        updateQueryNameHandler(queryId, queryName);
        resetSaveForm();
        onHide();
    };

    const closeModal = () => {
        resetSaveForm();
        onHide();
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Save Query</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <div className="input-login-header">Name</div>
                        <input className="form-control form-control-lg" placeholder="Query Name" type="text" value={queryName} onChange={e => setQueryName(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Description</div>
                        <input className="form-control form-control-lg" placeholder="Query Description" type="text" value={queryDesc} onChange={e => setQueryDesc(e.target.value)}/>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="primary" onClick={saveQuery}>Save Query</Button>
            </Modal.Footer>
        </Modal>
    );
}

function SaveQuery ({queryObj, currentUser, queryId, updateQueryNameHandler}) {

    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>
            <a href="#saveQueryLink" onClick={() => setModalShow(true)} className="icon-link">
                <span className="material-icons icon-margin-left">
                    save
                </span>
                <span className="icon-link-text">Save</span>
            </a>

            <SaveQueryModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                queryObj={queryObj}
                currentUser={currentUser}
                queryId={queryId}
                updateQueryNameHandler={updateQueryNameHandler}
            />
        </>
    );
    
}

export default SaveQuery;