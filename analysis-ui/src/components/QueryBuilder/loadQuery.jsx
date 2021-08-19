import React, {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const getSavedQueriesName = "getSavedQueries";

const LOAD_SAVED_QUERIES = gql`
    query getSavedQueries{
        getSavedQueries {
            name
            user
            queryObj
            description
            createdDate
            _id
        }
    }`;

function LoadQuerySearchBar({setSearch}) {
    return (
        <div className="load-query-search-container">
            <span className="material-icons icon-margin-left" style={{paddingRight: "5px", paddingTop: "7px", borderBottom: "1px solid", borderBottomStyle:"inset"}}>
                    search
            </span>
            <input className="load-query-search-bar" type="text" id="loadQuerySearchBar" placeholder="Search..." onChange={(e)=>setSearch(e.target.value)}/>
        </div>
    )
}
    
function LoadQueryModal({show, onHide, currentUser, loadQueryHandler}) {
    const [activeTab, setActiveTab] = useState("load_my_queries");
    const [search, setSearch] = useState("");

    const loadQuery = (query) => {
        loadQueryHandler(query);
        onHide();
    }

    const closeModal = () => {
        setSearch("");
        onHide();
    }

    return (
        <Modal show={show} onHide={closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter-load">Load Query</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Query query={LOAD_SAVED_QUERIES}  fetchPolicy={'network-only'}>
                {
                    ({ loading, error, data }) => {
                        if (loading) return <div>Loading ...</div> 
                        if (error) return <div>Error</div>
                        
                        let queries = data[getSavedQueriesName];
                        if(activeTab === 'load_my_queries') {
                            queries = queries.filter(query => query.user.id === currentUser.id)
                        }
                        queries.sort(function(a, b){return b.createdDate - a.createdDate});

                        return (
                            <div className="load-query-contents">
                                <div className="load-query-nav">
                                    <LoadQuerySearchBar setSearch={setSearch}/>
                                    <ul className="nav nav-tabs">
                                        <li className="nav-item">
                                            <button id={'load_my_queries'} className={'load_my_queries' === activeTab ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('load_my_queries')}>My Queries</button>
                                        </li>
                                        <li className="nav-item">
                                            <button id={'load_all_queries'} className={'load_all_queries' === activeTab ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('load_all_queries')}>All Queries</button>
                                        </li>
                                    </ul>
                                </div>
                                <div className="query-tab-contents saved-query-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Name</th>
                                                <th>Description</th>
                                                {activeTab === 'load_all_queries' &&
                                                    <th>User</th>
                                                }
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queries.map((query, key) =>
                                                (search === "" ||
                                                (query.name.toLowerCase().includes(search.toLowerCase()) || 
                                                query.description.toLowerCase().includes(search.toLowerCase()) || 
                                                query.user.username.toLowerCase().includes(search.toLowerCase()))) &&
                                                <tr key={'saved_query_row_' + key}>
                                                    <td>{(new Date(query.createdDate)).toLocaleString()}</td>
                                                    <td>{query.name}</td>
                                                    <td>{query.description}</td>
                                                    {activeTab === 'load_all_queries' &&
                                                        <td>{query.user.username}</td>
                                                    }
                                                    <td>
                                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => loadQuery(query)}>Load</button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>   
                            </div>
                        )
                    }
                }
                </Query>
            </Modal.Body>
        </Modal>
    );
}

function LoadQuery ({currentUser, loadQueryHandler}) {

    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>
            <a href="#loadQueryLink" onClick={() => setModalShow(true)} className="icon-link">
                <span className="material-icons icon-margin-right">
                    folder_open
                </span>
            </a>

            <LoadQueryModal
                show = {modalShow}
                onHide = {() => setModalShow(false)}
                currentUser = {currentUser}
                loadQueryHandler = {loadQueryHandler}
            />
        </>
    );
    
}

export default LoadQuery;