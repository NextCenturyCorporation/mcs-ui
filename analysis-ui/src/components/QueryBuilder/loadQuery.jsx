import React, {useState, useEffect} from 'react';
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
            groupBy
            sortBy
            description
            createdDate
            _id
        }
    }`;

function LoadQuerySearchBar({setSearch}) {
    return (
        <div className="load-query-search-container">
            <span className="material-icons icon-margin-left load-query-search-icon">
                    search
            </span>
            <input className="load-query-search-bar" type="text" id="loadQuerySearchBar" placeholder="Search..." onChange={(e)=>setSearch(e.target.value)}/>
        </div>
    )
}
    
function LoadQueryPage({show, onHide, currentUser, loadQueryHandler}) {
    const [activeTab, setActiveTab] = useState("load_all_queries");
    const [search, setSearch] = useState("");
    const [selectedQueries, setSelectedQueries] = useState([]);

    const loadQuery = () => {
        let queries = selectedQueries;
        loadQueryHandler(queries);
    }

    const manageSelectedQueries = (query, key, remove) => {
        if (remove)
            setSelectedQueries(selectedQueries.filter(item => key != item.key));
        else
            setSelectedQueries([...selectedQueries, {'query': query, 'key': key}]);
    }

    const updateSelectedBasedOnSearch = () => {
        let checkboxes = document.getElementsByClassName('load-query-checkbox');
        for (let i = 0; i < checkboxes.length; i++) {
            let row = checkboxes[i].parentNode.parentNode;
            for(let j = 0; j<selectedQueries.length; j++) {
                let key = parseInt(row.getAttribute('id').replace('load_query_row_', ''));
                if (key == selectedQueries[j].key) {
                    if (!row.className.includes('selected-row') && !checkboxes[i].checked) {
                        row.classList.toggle('selected-row');
                        checkboxes[i].checked = true;
                    }
                }
            }
        }
    }

    useEffect(() => {
        let checkbox = document.getElementById('header_checkbox');
        if (checkbox !== null)
            checkbox.checked = selectedQueries.length > 0;
    }, [selectedQueries])

    useEffect(() => {
        updateSelectedBasedOnSearch();
    }, [search])

    useEffect(() => {
        updateSelectedBasedOnSearch();
    }, [activeTab])

    const setSelected = (key, button) => {
        const checkbox = document.getElementById('load_query_checkbox_' + key);
        checkbox.checked = !checkbox.checked;
        if (!button) {
            const row = document.getElementById('load_query_row_' + key);
            let query = JSON.parse(row.getAttribute('query'));
            row.classList.toggle('selected-row');
            manageSelectedQueries(query, key, !checkbox.checked)
        }
    }

    const selectOrClearAll = (e) => {
        let checkboxes = document.getElementsByClassName('load-query-checkbox');
        let clearAll = !e.target.checked
        if (clearAll) {
            for (let i=0; i<checkboxes.length; i++) {
                checkboxes[i].checked = false;
                let row = checkboxes[i].parentNode.parentNode;
                if (row.className.includes('selected-row')) {
                    row.classList.toggle('selected-row');
                }
            }
            setSelectedQueries([]);
        }
        else {
            let selected = []
            for (let i=0; i<checkboxes.length; i++) {
                if (!checkboxes[i].checked) {
                    checkboxes[i].checked = true;
                    let row = checkboxes[i].parentNode.parentNode;
                    row.classList.toggle('selected-row');
                    let query = JSON.parse(row.getAttribute('query'));
                    let key = parseInt(row.getAttribute('id').replace('load_query_row_', ''));
                    selected.push({'query': query, 'key': key})
                }
            }
            setSelectedQueries([...selectedQueries, ...selected])
        }
    }

    return (
        <div>
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
                            <header className='load-query-header'>Load Query</header>
                            <div className="load-query-nav">
                                <span>
                                    <button id={'load_all_queries'} className={'load_all_queries' === activeTab ? 'selected' : ''} onClick={e => setActiveTab('load_all_queries')}>All Queries</button>
                                    <button id={'load_my_queries'} className={'load_my_queries' === activeTab ? 'selected' : ''} onClick={e => setActiveTab('load_my_queries')}>My Queries</button>
                                </span>
                            </div>
                            <div className="load-query-search-load-line">
                                <LoadQuerySearchBar setSearch={setSearch}/>
                                <span>
                                    <a href='#selected' data-toggle="tooltip" 
                                    title='Selecting one query will replace the current query tab. Selecting more than one query will append multiple queries to the end of the tab list.'>({selectedQueries.length}) Selected</a>
                                    <button type="button" onClick={() => loadQuery()}>Load Selected</button>
                                </span>
                            </div>
                            <table className="load-query-table">
                                <thead>
                                    <tr>
                                        <th style={{columnWidth: '1vw'}}>
                                            <a href='#' data-toggle="tooltip" title="Checking this box will select all of the queries matching the search parameters. 
                                            If there are no search parameters, all queries will be selected. Unchecking this box will clear all selections.">
                                                <input type="checkbox" id="header_checkbox" onClick={(e) => selectOrClearAll(e)}/>
                                            </a>
                                        </th>
                                        <th style={{columnWidth: '50vw'}}>Title</th>
                                        <th style={{columnWidth: '10vw'}}>Date</th>
                                        {activeTab === 'load_all_queries' &&
                                            <th style={{columnWidth: '1vw'}}>User</th>
                                        }
                                        <th style={{columnWidth: '28vw'}}>Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        queries.map((query, key) =>
                                        (search === "" ||
                                        (query.name.toLowerCase().includes(search.toLowerCase()) || 
                                        query.description.toLowerCase().includes(search.toLowerCase()) || 
                                        query.user.username.toLowerCase().includes(search.toLowerCase()))) &&
                                        <tr key={'load_query_row_' + key} id={'load_query_row_' + key} onClick={() => setSelected(key, false)} query={JSON.stringify(query)}>
                                            <td>
                                                <input type="checkbox" className='load-query-checkbox' id={'load_query_checkbox_' + key} onClick={() => setSelected(key, true)}/>
                                            </td>
                                            <td>{query.name}</td>
                                            <td>{(new Date(query.createdDate)).toLocaleString()}</td>
                                            {activeTab === 'load_all_queries' &&
                                                <td>{query.user.username}</td>
                                            }
                                            <td>{query.description}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            }
            </Query>
        </div>
    );
}

function LoadQuery ({currentUser, loadQueryHandler}) {
    return (
        <LoadQueryPage
            currentUser = {currentUser}
            loadQueryHandler = {loadQueryHandler}
        />
    );
    
}

export default LoadQuery;