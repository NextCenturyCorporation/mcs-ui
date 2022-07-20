import React, {useState, useEffect} from 'react';
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

function DeleteQueryModal({show, onHide, selectedQueries, deleteFromQueryTabId, currentUser, getSavedQueries, getSavedQueriesName, clearOrCloseTabsOnDeleteQuery, resetLoadQuerySelections, setShowDeleteQuery}) {
    const [totalUserQueries, setTotalUserQueries] = useState('');
    const [deleteQueryCall] = useMutation(DELETE_QUERY, getSavedQueries !== null ? {
        refetchQueries: [
          {query: getSavedQueries}, getSavedQueriesName
        ],
    } : {});

    const deleteQuery = () => {
        if (deleteFromQueryTabId !== null) {
            deleteQueryCall({ variables: {
                _id: deleteFromQueryTabId
            }})
            clearOrCloseTabsOnDeleteQuery(deleteFromQueryTabId);
        }
        else {
            selectedQueries.forEach(item => {
                if (item.query.user.id === currentUser.id) {
                    deleteQueryCall({ variables: {
                        _id: item.query._id
                    }})
                }
            })
            if (resetLoadQuerySelections !== null)
                resetLoadQuerySelections()
            clearOrCloseTabsOnDeleteQuery(selectedQueries);
        }
        onHide();
    }

    const getTotalUserQueries = () => {
        console.log(selectedQueries)
        if (deleteFromQueryTabId !== null) {
            setTotalUserQueries('this');
            return;
        }
        let count = 0;
        selectedQueries.forEach(item => count += (item.query.user.id === currentUser.id ? 1 : 0));
        setTotalUserQueries(count);
        setShowDeleteQuery(count > 0);
        
    }

    const correctQueryString = () => {
        return `${totalUserQueries} ${deleteFromQueryTabId !== null || totalUserQueries === 1 ? 'Query' : 'Queries'}`;
    }

    useEffect(() => {
        getTotalUserQueries();
    }, [selectedQueries])


    return (
        <Modal show={show} onHide={onHide} size={deleteFromQueryTabId !== null ? "lg" : "xl"} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{deleteFromQueryTabId !== null ? "Permanently Delete this Query?" : `Delete ${correctQueryString()} for User - ${currentUser.username}`}</Modal.Title>
            </Modal.Header>
            {
                deleteFromQueryTabId === null &&
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
            }
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={deleteQuery}>Delete {correctQueryString()} (Cannot be Undone)</Button>
            </Modal.Footer>
        </Modal>
    );
}

function DeleteQuery ({selectedQueries, deleteFromQueryTabId, currentUser, getSavedQueries, getSavedQueriesName, showText, clearOrCloseTabsOnDeleteQuery, resetLoadQuerySelections, showDeleteQuery, setShowDeleteQuery}) {

    const [modalShow, setModalShow] = useState(false);

    return (
        <>
            {
                ((resetLoadQuerySelections !== null && showDeleteQuery) || (resetLoadQuerySelections === null)) &&
                <a href="#deleteQueryLink" onClick={() => setModalShow(true)} className="icon-link">
                    <span className="material-icons icon-margin-left" style={!showText ? {fontSize: '35px', margin: '-6px', marginRight: '-35px'} : {}}>
                        delete_forever
                    </span>
                    { showText && <span className="icon-link-text">Delete</span> }
                </a>
            }

            <DeleteQueryModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                selectedQueries={selectedQueries}
                deleteFromQueryTabId={deleteFromQueryTabId}
                currentUser={currentUser}
                getSavedQueries={getSavedQueries}
                getSavedQueriesName={getSavedQueriesName}
                clearOrCloseTabsOnDeleteQuery={clearOrCloseTabsOnDeleteQuery}
                resetLoadQuerySelections={resetLoadQuerySelections}
                setShowDeleteQuery={setShowDeleteQuery}
            />
        </>
    );
    
}

export default DeleteQuery;