import React from 'react';
import QueryLineItem from './queryLine';
import QueryResults from './queryResults';
import SaveQuery from './saveQuery';
import CancelPresentation from '@material-ui/icons/CancelPresentation';

const ParamDisplayByOperator =({queryLine}) => {
    if(queryLine.functionOperator === "between" || queryLine.functionOperator === "and" || queryLine.functionOperator === "or") {
        return(
            <>
                <div className="query-field-param">{queryLine.fieldValue1.toString()}</div>
                <span className="material-icons query-param-spacer">add</span>
                <div className="query-field-param-operator">{queryLine.functionOperator}</div>
                <span className="material-icons query-param-spacer">add</span>
                <div className="query-field-param">{queryLine.fieldValue2.toString()}</div>
            </>
        );
    } else {
        return(
            <>
                <div className="query-field-param-operator">{queryLine.functionOperator.indexOf("equal") > -1 ? "equals" : queryLine.functionOperator}</div>
                <span className="material-icons query-param-spacer">add</span>
                <div className="query-field-param">{queryLine.fieldValue1.toString().replace(/__,__/g, ",")}</div>
            </>
        );
    }
}
class ComplexQueryBuilder extends React.Component {

    constructor() {
        super();

        this.queryLineHandler = this.queryLineHandler.bind(this);
        this.clearQuery = this.clearQuery.bind(this);
        this.closeTab = this.closeTab.bind(this);

        this.state = {
            showModal: false
        }
    }

    clearQuery = () => {
        this.props.updateQueryObjForTab([], null, null, this.props.queryId, "Query " + this.props.queryId, "");
    }

    removeQueryRow = (key) => {
        let newArray = this.props.saveQueryObject.concat();
        newArray.splice(key, 1);

        this.props.updateQueryObjForTab(newArray, null, null, this.props.queryId);
    }

    queryLineHandler(qlObj) {
        let newArray = this.props.saveQueryObject.concat();
        newArray.push(qlObj);

        this.props.updateQueryObjForTab(newArray, null, null, this.props.queryId);
    }

    closeTab = () => {
        this.props.closeQueryTab(this.props.queryId);
    }

    render() {
        return (
            <div>
                <div className="query-controls">
                    <SaveQuery queryObj={this.props.saveQueryObject} currentUser={this.props.currentUser}
                        queryId={this.props.queryId} updateQueryNameHandler={this.props.updateQueryNameHandler} sortBy={this.props.sortBy} groupBy={this.props.groupBy}/>
                    <a href="#clearQueryLink" onClick={this.clearQuery} className="icon-link">
                        <span className="material-icons icon-margin-left">settings_backup_restore</span>
                        <span className="icon-link-text">Clear</span>
                    </a>
                    {this.props.numberTabs > 1 && 
                        <a href="#closeTabLink" onClick={this.closeTab} className="icon-link close-tab-link">
                            <CancelPresentation/>
                            <span className="icon-link-text-close">Close</span>
                        </a>
                    }
                </div>
                <div className="query-builder-holder">
                    <div className="query-parameter-header">Add New Parameter:</div>
                    <div className="query-parameter-adder">
                        <QueryLineItem queryLineHandler={this.queryLineHandler}/>
                    </div>
                    <div className="query-parameters-holder">
                        {this.props.saveQueryObject.map((queryLine, key) => 
                            <div key={'query_parameter_' + key} className="query-added-parameter">
                                <a href="#removeAddedParam" onClick={() => this.removeQueryRow(key)} className="remove-param-link">
                                    <span className="material-icons query-line-remove-icon">
                                        clear
                                    </span>
                                </a>
                                <div className="query-field-param">{queryLine.fieldTypeLabel}</div>
                                <span className="material-icons query-param-spacer">add</span>
                                <div className="query-field-param">{queryLine.fieldNameLabel}</div>
                                <span className="material-icons query-param-spacer">add</span>
                                <ParamDisplayByOperator queryLine={queryLine}/>
                            </div>
                        )}
                        {this.props.saveQueryObject.length === 0 &&
                            <div className="no-query-params">No search parameters added yet.</div>
                        }
                    </div>
                </div>
                <QueryResults queryObj={this.props.saveQueryObject} tabId={this.props.tabId} queryMongoId={this.props.queryMongoId} currentTab={this.props.currentTab} name={this.props.name}
                    setTableSortBy={this.props.setTableSortBy} sortBy={this.props.sortBy} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} 
                    queryResultsTableRef={this.props.queryResultsTableRef} client={this.props.client}/>
            </div>
        );
    }
}

export default ComplexQueryBuilder;