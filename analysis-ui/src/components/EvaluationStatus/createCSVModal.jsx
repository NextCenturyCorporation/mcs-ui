import React, {useState} from 'react';
import gql from 'graphql-tag';
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Query } from 'react-apollo';
import {useMutation} from 'react-apollo';

const getCollectionsName = "getScenesAndHistoryTypes";
const GET_COLLECTIONS = gql`
    query getScenesAndHistoryTypes{
        getScenesAndHistoryTypes  {
            value 
            label
        }
    }`;

const GET_CSV = gql`
    mutation createCSV($collectionName: String!, $eval: String!){
        createCSV(collectionName: $collectionName,eval: $eval) 
  }`;

function CreateCSVModal({show, onHide}) {
    const [csvCollection, setCsvCollection] = useState({});
    const [launchCreateCSVCall] = useMutation(GET_CSV);

    const closeModal = () => {
        onHide();
    }

    const launchCSVCreate = () => {
        if(csvCollection !== undefined && csvCollection !== null) {

            launchCreateCSVCall({ variables: { 
                collectionName: csvCollection.value,
                eval: csvCollection.label
            } }).then(() => {
                onHide();
            });
        }

        onHide();
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Create CSV File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <Query query={GET_COLLECTIONS}>
                        {
                            ({ loading, error, data }) => {
                                if (loading) return <div>Loading ...</div> 
                                if (error) return <div>Error</div>
                                
                                const options = data[getCollectionsName].sort((a, b) => (a.label > b.label) ? 1 : -1);

                                return (
                                    <div className="form-group">
                                        <div className="input-login-header">Evaluation CSV File:</div>
                                        <Select
                                            onChange={setCsvCollection}
                                            options={options}
                                            placeholder="Select the collection..."
                                            defaultValue={csvCollection}
                                        />
                                    </div>
                                )
                            }
                        }
                    </Query>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="info" onClick={launchCSVCreate}>Create</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CreateCSVModal;