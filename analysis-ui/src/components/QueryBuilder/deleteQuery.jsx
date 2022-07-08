import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';
import gql from 'graphql-tag';

const DELETE_QUERY = gql`
    mutation deleteQuery($_id: String!){
        deleteQuery(_id: $_id) {
            _id
        }
  }`;

function DeleteQueryModal({show, onHide, selectedQueries, currentUser, totalUserQueries, getSavedQueries, getSavedQueriesName}) {
    const [deleteQueryCall] = useMutation(DELETE_QUERY, {
        refetchQueries: [
          {query: getSavedQueries}, getSavedQueriesName
        ],
    });

    const deleteQuery = () => {
        console.log(selectedQueries[0])
        selectedQueries.forEach(item => {
            if (item.query.user.id === currentUser.id) {
                deleteQueryCall({ variables: {
                    _id: item.query._id
                }})
            }
        })
        closeModal()
    }

    const closeModal = () => {
        onHide()
    }

    return (
        <Modal show={show} onHide={closeModal} size="xl" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Delete ({totalUserQueries}) Queries For User - {currentUser.username}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <table className="delete-query-table">
                    <thead>
                        <tr>
                            <th className='name'>Title</th>
                            <th className='date'>Date</th>
                            <th className='comment'>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            selectedQueries.map((item, key) =>
                                (item.query.user.id === currentUser.id) &&
                                <tr key={'delete_query_row_' + key} id={'delete_query_row_' + key}>
                                    <td>{item.query.name}</td>
                                    <td>{(new Date(item.query.createdDate)).toLocaleString()}</td>
                                    <td>{item.query.description}</td>
                                </tr>
                        )}
                    </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="primary" onClick={deleteQuery}>Confirm Delete {totalUserQueries} Queries (Cannot be Undone)</Button>
            </Modal.Footer>
        </Modal>
    );
}

function DeleteQuery ({selectedQueries, currentUser, getSavedQueries, getSavedQueriesName}) {

    const [modalShow, setModalShow] = useState(false);

    const getTotalUserQueries = () => {
        let count = 0;
        selectedQueries.forEach( item => count += (item.query.user.id === currentUser.id ? 1 : 0) );
        return count;
    }

    return (
        <>
            <a href="#deleteQueryLink" onClick={() => setModalShow(true)} className="icon-link">
                <span className="material-icons icon-margin-left" style={{fontSize: '35px', margin: '-5px'}}>
                    delete_forever
                </span>
            </a>

            <DeleteQueryModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                selectedQueries={selectedQueries}
                totalUserQueries={getTotalUserQueries()}
                currentUser={currentUser}
                getSavedQueries={getSavedQueries}
                getSavedQueriesName={getSavedQueriesName}
            />
        </>
    );
    
}

export default DeleteQuery;