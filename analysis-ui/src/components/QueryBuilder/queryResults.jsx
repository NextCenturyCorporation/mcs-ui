import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import QueryResultsTable from './queryResultsTable';
import {PerformanceStatistics} from './performanceStatistics';

const complexQueryName = "createComplexQuery";

const create_complex_query = gql`
    query createComplexQuery($queryObject: JSON!, $currentPage: Int!, $resultsPerPage: Int!, $sortBy: String, $sortOrder: String, $groupBy: String) {
        createComplexQuery(queryObject: $queryObject, currentPage: $currentPage, resultsPerPage: $resultsPerPage, sortBy: $sortBy, sortOrder: $sortOrder, groupBy: $groupBy) 
    }`;

class Results extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            rowsPerPage: 10
        };

        this.pageUpdateHandler = this.pageUpdateHandler.bind(this);
        this.rowsUpdatehandler = this.rowsUpdatehandler.bind(this);
        this.getGroupingRows = this.getGroupingRows.bind(this);
        this.getCSVDownloadData = this.getCSVDownloadData.bind(this);
    }

    pageUpdateHandler(newPage) {
        this.setState({page: newPage});
    }

    rowsUpdatehandler(newRowNumber) {
        this.setState({
            rowsPerPage: parseInt(newRowNumber, 10),
            page: 0
        });
    }

    async getGroupingRows(rowTotal, key, parameter) {
        const groupObject = {
            fieldType: this.props.queryObj[0].fieldType,
            fieldName: key,
            fieldValue1: parameter
        };

        const queryObject = this.props.queryObj.concat([groupObject]);

        const result = await this.props.client.query({
            query: create_complex_query,
            variables: {
                "queryObject": queryObject,
                "currentPage": 0,
                "resultsPerPage": rowTotal,
                "sortBy": ""
            }
        });
        
        return result.data[complexQueryName].results[0].results;
    }

    async getCSVDownloadData(totalRows) {
        const result = await this.props.client.query({
            query: create_complex_query,
            variables: {
                "queryObject": this.props.queryObj,
                "currentPage": 0,
                "resultsPerPage": totalRows,
                "sortBy": ""
            }
        });

        return result.data[complexQueryName].results[0];
    }

    render() { 
        return (
            <Query query={create_complex_query} variables={
                {
                    "queryObject": this.props.queryObj,
                    "currentPage": this.state.page,
                    "resultsPerPage": this.state.rowsPerPage,
                    "sortBy": this.props.sortBy.property,
                    "sortOrder": this.props.sortBy.sortOrder,
                    "groupBy": this.props.groupBy.value
                }}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Results are currently loading ... </div> 
                    if (error) return <div>Error</div>

                    let resultsData = data[complexQueryName].results.length > 1 ? 
                            data[complexQueryName].results : data[complexQueryName].results[0].results;
                    const metadata = data[complexQueryName].results[0].metadata[0];
                    const historyCollection = data[complexQueryName].historyCollection;

                    let columns = [];
                    let noneOption = [{value: "", label: "None"}];
                    let optionsToAdd = [];
                    for (const key in data[complexQueryName].historyMap) {
                        columns.push({dataKey: key, title: data[complexQueryName].historyMap[key]});
                        optionsToAdd.push({value: key, label: data[complexQueryName].historyMap[key]});
                    }
                    for (const key in data[complexQueryName].sceneMap) {
                        columns.push({dataKey: "scene." + key, title: data[complexQueryName].sceneMap[key]});
                        optionsToAdd.push({value: "scene." + key, label: data[complexQueryName].sceneMap[key]});
                    }

                    const options = noneOption.concat(optionsToAdd.sort((a, b) => (a.label > b.label) ? 1 : -1));

                    if(resultsData.length === 0) {
                        return (
                            <div>No Results</div>
                        );
                    } else {
                        return (
                            <div className="query-results-holder">
                                <div className="query-results-header">
                                    <h5>Query Results</h5>
                                    <div className="query-num-results">
                                        Display: {metadata.total} Results 
                                    </div>
                                    <PerformanceStatistics resultsData={metadata}/>
                                </div>
                                <QueryResultsTable columns={columns} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} rows={resultsData} name={this.props.name}
                                    groupByOptions={options} setTableSortBy={this.props.setTableSortBy} sortBy={this.props.sortBy} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} ref={this.props.queryResultsTableRef}
                                    page={this.state.page} rowsPerPage={this.state.rowsPerPage} pageUpdateHandler={this.pageUpdateHandler} rowsUpdatehandler={this.rowsUpdatehandler} totalResultCount={metadata.total}
                                    getGroupingRows={this.getGroupingRows} getCSVDownloadData={this.getCSVDownloadData} historyCollection={historyCollection}/>
                            </div>
                        );
                    }
                }
            }
            </Query>
        );
    }
};


class ResultsTable extends React.Component {
    render() {
        if(_.isEmpty(this.props.queryObj)) {
            return(<div>Enter some parameters to see query results.</div>);
        } else {
            return(<Results queryObj={this.props.queryObj} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} name={this.props.name}
                setTableSortBy={this.props.setTableSortBy} sortBy={this.props.sortBy} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} queryResultsTableRef={this.props.queryResultsTableRef}
                client={this.props.client}/>)
        }
    }
};


class QueryResults extends React.Component {
    render() {
        return (
            <div className="query-results-holder">
                <ResultsTable queryObj={this.props.queryObj} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} name={this.props.name}
                    setTableSortBy={this.props.setTableSortBy} sortBy={this.props.sortBy} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} queryResultsTableRef={this.props.queryResultsTableRef}
                    client={this.props.client}/>
            </div>
        );
    }
}

export default QueryResults;
