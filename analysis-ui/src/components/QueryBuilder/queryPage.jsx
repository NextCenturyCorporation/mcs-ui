import React from 'react';
import ComplexQueryBuilder from './queryBuilder';
import $ from 'jquery';
import LoadQuery from './loadQuery';

class QueryPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            queryTabs: [{
                id: 1, 
                name: "Query 1", 
                tabQueryObj: [],
                mongoId: ""
            }],
            currentTab: 1,
            totalTab: 1
        };

        this.addTab = this.addTab.bind(this);
        this.updateQueryNameHandler = this.updateQueryNameHandler.bind(this);
        this.loadQueryHandler = this.loadQueryHandler.bind(this);
        this.updateQueryObjForTab = this.updateQueryObjForTab.bind(this);
        this.closeQueryTab = this.closeQueryTab.bind(this);

        if(this.props !== null & this.props.currentUser !== null) {
            if(this.props.currentUser.queryBuilderState !== undefined && this.props.currentUser.queryBuilderState !== null) {
                this.state = this.props.currentUser.queryBuilderState;
            }
        }
    }

    addTab = (event) => {
        let newArray = this.state.queryTabs.concat({
            id: this.state.totalTab+1, 
            name: "Query " + (this.state.totalTab+1),
            tabQueryObj: [],
            mongoId: ""
        });

        this.setState({ 
            totalTab: this.state.totalTab+1, 
            queryTabs: newArray
        });

        this.props.currentUser["queryBuilderState"] = this.state;
    }

    updateQueryState = (newArray, newCurrentTab) => {
        this.setState({ 
            queryTabs: newArray,
            currentTab: newCurrentTab !== undefined && newCurrentTab !== null ? newCurrentTab : this.state.currentTab
        });

        this.props.currentUser["queryBuilderState"] = this.state;
    }

    updateQueryNameHandler = (queryId, newQueryName, queryMongoId) => {
        let newArray = this.state.queryTabs.concat();
        for(let i=0; i < newArray.length; i++) {
            if(newArray[i].id === queryId) {
                newArray[i].name = newQueryName;
                newArray[i].mongoId = queryMongoId;
            }
        }

        this.updateQueryState(newArray);
    }

    loadQueryHandler = (queryObj) => {
        this.updateQueryObjForTab(queryObj.queryObj, this.state.currentTab, queryObj.name, queryObj._id);
    }

    updateQueryObjForTab = (queryObj, queryId, tabName, mongoQueryId) => {
        let newArray = this.state.queryTabs.concat();
        for(let i=0; i < newArray.length; i++) {
            if(newArray[i].id === queryId) {
                newArray[i].tabQueryObj = queryObj;
                if(tabName !== undefined) {
                    newArray[i].name = tabName;
                    newArray[i].mongoId = mongoQueryId;
                }
            }
        } 

        this.updateQueryState(newArray);
    }

    changeQueryTab = (objectKey) => {
        if(objectKey === this.state.currentTab) {
            return;
        }

        $('#tabObj_button_' + this.state.currentObjectNum ).toggleClass( "active" );
        $('#tabObj_button_' + objectKey ).toggleClass( "active" );

        this.setState({ currentTab: objectKey});

        this.props.currentUser["queryBuilderState"] = this.state;
    }

    closeQueryTab = (queryId) => {
        let newArray = this.state.queryTabs.concat();
        let newCurrentTab = this.state.currentTab;
        for(let i=0; i < newArray.length; i++) {
            if(newArray[i].id === queryId) {
                newArray.splice(i, 1);
            }
        } 

        if(newCurrentTab === queryId) {
            newCurrentTab = newArray[0].id;
        }

        this.updateQueryState(newArray, newCurrentTab);
    }

    render() {
        return (
            <div className="query-page-contents">
                <div className="query-builder-nav">
                    <ul className="nav nav-tabs">
                        {this.state.queryTabs.map((tabObj, key) => 
                            <li className="nav-item" key={'tabObj' + key}>
                                <button id={'tabObj_button_' + tabObj.id} className={tabObj.id === this.state.currentTab ? 'nav-link active' : 'nav-link'} onClick={() => this.changeQueryTab(tabObj.id)}>{tabObj.name}</button>
                            </li>
                        )}
                    </ul>
                    <div className="query-tab-controls">
                        <a href="#addTab" onClick={this.addTab} className="icon-link">
                            <span className="material-icons icon-margin-right">
                                add
                            </span>
                        </a>
                        <LoadQuery currentUser={this.props.currentUser} loadQueryHandler={this.loadQueryHandler}/>
                    </div>
                </div>
                <div className="query-tab-contents">
                    {this.state.queryTabs.map((tabObj, key) => 
                        <div key={'query_tab_' + key} className={tabObj.id === this.state.currentTab ? null : 'd-none'}>
                            <ComplexQueryBuilder queryId={tabObj.id} saveQueryObject={tabObj.tabQueryObj} currentUser={this.props.currentUser} 
                                updateQueryNameHandler={this.updateQueryNameHandler} updateQueryObjForTab={this.updateQueryObjForTab} 
                                closeQueryTab={this.closeQueryTab} numberTabs={this.state.queryTabs.length} queryMongoId={tabObj.mongoId}/>
                        </div>
                    )}
                </div>   
            </div>
        );
    }
}

export default QueryPage;