import React, {useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';
import gql from 'graphql-tag';
import Check from 'react-bootstrap/FormCheck';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const UPDATE_QUERY_NAME = "updateQuery";
const UPDATE_QUERY = gql`
    mutation updateQuery($queryObj: JSON!, $groupBy: JSON!, $sortBy: JSON!, $name: String!, $description: String!, $createdDate: Float!, $_id: String!) {
        updateQuery(queryObj: $queryObj,  groupBy: $groupBy, sortBy: $sortBy, name: $name, description: $description, createdDate: $createdDate, _id: $_id) {
            name
            description
            createdDate
            _id
        }
  }`;

  const UPDATE_QUERY_NAME_AND_DESCRIPTION_ONLY_NAME = "updateQueryNameAndDescriptionOnly";
  const UPDATE_QUERY_NAME_AND_DESCRIPTION_ONLY = gql`
      mutation updateQueryNameAndDescriptionOnly($name: String!, $description: String!, $createdDate: Float!, $_id: String!) {
          updateQueryNameAndDescriptionOnly(name: $name, description: $description, createdDate: $createdDate, _id: $_id) {
              name
              description
              createdDate
              _id
          }
    }`;

function UpdateQueryModal({show, onHide, queryObj, queryName, queryDescription, queryMongoId, updateTabsOnUpdateQuery, groupBy, sortBy}) {
    const [updatedQueryName, setQueryName] = useState(queryName);
    const [updatedQueryDescription, setQueryDesc] = useState(queryDescription);
    const [updateQueryCall] = useMutation(UPDATE_QUERY);
    const [updateQueryNameAndDescriptionOnlyCall] = useMutation(UPDATE_QUERY_NAME_AND_DESCRIPTION_ONLY);
    const [updateQueryContents, setUpdateQueryContents] = useState(true)

    const resetUpdateForm = () => {
        setQueryName(queryName);
        setQueryDesc(queryDescription);
        setUpdateQueryContents(true);
    }

    const updateQuery = () => {
        if (updateQueryContents) {
            updateQueryCall({ variables: {
                _id: queryMongoId,
                queryObj: queryObj,
                groupBy: groupBy,
                sortBy: sortBy,
                name: updatedQueryName,
                description: updatedQueryDescription,
                createdDate: (new Date()).valueOf()
            } })
            updateTabsOnUpdateQuery(queryObj, groupBy, sortBy, updatedQueryName, updatedQueryDescription, queryMongoId);
        }
        else {
            updateQueryNameAndDescriptionOnlyCall({ variables: {
                _id: queryMongoId,
                name: updatedQueryName,
                description: updatedQueryDescription,
                createdDate: (new Date()).valueOf()
            } })
            updateTabsOnUpdateQuery(null, null, null, updatedQueryName, updatedQueryDescription, queryMongoId);
        }
        resetUpdateForm();
        onHide();
    };

    const closeModal = () => {
        resetUpdateForm();
        onHide();
    }

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          Toggle off to only update the name and description
        </Tooltip>
      );

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Update Query</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <div className="input-login-header">Name</div>
                        <input className="form-control form-control-lg" placeholder="Query Name" type="text" value={updatedQueryName} list="name-recomendations" 
                            onChange={(e) => setQueryName(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Description</div>
                        <input className="form-control form-control-lg" placeholder="Query Description" type="text" value={updatedQueryDescription} list="name-recomendations" 
                            onChange={(e) => setQueryDesc(e.target.value)}/>
                    </div>
                    <OverlayTrigger placement="left" delay={{ show: 50, hide: 200 }} overlay={renderTooltip}>
                        <Check onClick={() => setUpdateQueryContents(!updateQueryContents)} checked={updateQueryContents} type="switch" id="custom-switch" label="Update Query Contents"/>
                    </OverlayTrigger>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="primary" onClick={updateQuery}>Update Query</Button>
            </Modal.Footer>
        </Modal>
    );
}

function UpdateQuery ({queryObj, queryName, queryDescription, queryMongoId, updateTabsOnUpdateQuery, groupBy, sortBy}) {

    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>
            <a href="#updateQueryLink" onClick={() => setModalShow(true)} className="icon-link">
                <span className="material-icons icon-margin-left">update</span>
                <span className="icon-link-text">Update</span>
            </a>

            <UpdateQueryModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                queryObj={queryObj}
                queryName={queryName}
                queryDescription={queryDescription} 
                queryMongoId={queryMongoId}
                updateTabsOnUpdateQuery={updateTabsOnUpdateQuery}
                groupBy={groupBy}
                sortBy={sortBy}
            />
        </>
    );
    
}

export default UpdateQuery;