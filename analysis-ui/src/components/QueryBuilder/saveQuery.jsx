import React, {useState, useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {useMutation} from 'react-apollo';
import gql from 'graphql-tag';

const SAVE_QUERY_NAME = "saveQuery";
const SAVE_QUERY = gql`
    mutation saveQuery($user: JSON!, $queryObj: JSON!, $groupBy: JSON!, $sortBy: JSON!, $name: String!, $description: String!, $createdDate: Float!){
        saveQuery(user: $user, queryObj: $queryObj,  groupBy: $groupBy, sortBy: $sortBy, name: $name, description: $description, createdDate: $createdDate) {
            name
            _id
        }
  }`;

function SaveQueryModal({show, onHide, queryObj, currentUser, queryId, updateQueryNameHandler, groupBy, sortBy}) {
    const [queryName, setQueryName] = useState("");
    const [queryDesc, setQueryDesc] = useState("");
    const [saveQueryCall] = useMutation(SAVE_QUERY);
    const [arrayOfNameSuggestions, setArrayOfNameSuggestions] = useState([]);

    const resetSaveForm = () => {
        setQueryName("");
        setQueryDesc("");
    }

    const saveQuery = () => {
        saveQueryCall({ variables: { 
            user: currentUser,
            queryObj: queryObj,
            groupBy: groupBy,
            sortBy: sortBy,
            name: queryName,
            description: queryDesc,
            createdDate: (new Date()).valueOf()
        } }).then((result) => {
            updateQueryNameHandler(queryId, queryName, result.data[SAVE_QUERY_NAME]["_id"]);
            resetSaveForm();
            onHide();
        });
    };

    const closeModal = () => {
        resetSaveForm();
        onHide();
    }

    const getNameRecs = () => {
        let arrayOfNameSuggestions = [];
        const getFullQueryName = (queryLine) => {
            let subArray = [];
            subArray.push(queryLine.fieldTypeLabel);
            subArray.push(queryLine.fieldNameLabel);
            if(queryLine.functionOperator === "between" || queryLine.functionOperator === "and" || queryLine.functionOperator === "or") {
                subArray.push(queryLine.fieldValue1.toString())
                subArray.push(queryLine.functionOperator)
                subArray.push(queryLine.fieldValue2.toString())
            } else {
                subArray.push(queryLine.functionOperator)
                subArray.push(queryLine.fieldValue1.toString())
            }
            arrayOfNameSuggestions.push(subArray);
        }

        queryObj.forEach(item => {
            getFullQueryName(item);
        });

        let combineAll = "";
        arrayOfNameSuggestions.forEach((item, i) => combineAll += Array.from(item).join(" ") + (i===arrayOfNameSuggestions.length-1 ? "" : ' & '));
        arrayOfNameSuggestions.push(combineAll);
        setArrayOfNameSuggestions(arrayOfNameSuggestions);
    }

    useEffect(() => {
        getNameRecs();
    }, [show])

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">Save Query</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <div className="input-login-header">Name</div>
                        <input className="form-control form-control-lg" placeholder="Query Name" type="text" value={queryName} list="name-recomendations" 
                            onChange={e => setQueryName(e.target.value === "Combine All" ? arrayOfNameSuggestions[arrayOfNameSuggestions.length-1] : e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <div className="input-login-header">Description</div>
                        <input className="form-control form-control-lg" placeholder="Query Description" type="text" value={queryDesc} list="name-recomendations" 
                            onChange={e => setQueryDesc(e.target.value === "Combine All" ? arrayOfNameSuggestions[arrayOfNameSuggestions.length-1] : e.target.value)}/>
                    </div>
                    <datalist id="name-recomendations">
                        {
                            arrayOfNameSuggestions.map((item, i) => {
                                return (
                                    <option key={i} value={i===arrayOfNameSuggestions.length - 1 ? "Combine All" : Array.from(item).join(' ')}/>
                                )
                            })
                        }
                    </datalist>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button variant="primary" onClick={saveQuery}>Save Query</Button>
            </Modal.Footer>
        </Modal>
    );
}

function SaveQuery ({queryObj, currentUser, queryId, updateQueryNameHandler, groupBy, sortBy}) {

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
                groupBy={groupBy}
                sortBy={sortBy}
            />
        </>
    );
    
}

export default SaveQuery;