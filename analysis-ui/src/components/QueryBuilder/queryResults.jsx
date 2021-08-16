import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";
import QueryResultsTable from './queryResultsTable';
import {PerformanceStatistics} from './performanceStatistics';

const complexQueryName = "createComplexQuery";

const create_complex_query = gql`
    query createComplexQuery($queryObject: JSON!) {
        createComplexQuery(queryObject: $queryObject) 
    }`;

class Results extends React.Component {

    render() {
        return (
            <Query query={create_complex_query} variables={{"queryObject": this.props.queryObj}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Results are currently loading ... </div> 
                    if (error) return <div>Error</div>
                    
                    let resultsData = data[complexQueryName].results;

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
                                        Display: {resultsData.length} Results 
                                    </div>
                                    <PerformanceStatistics resultsData={resultsData}/>
                                </div>
                                <QueryResultsTable columns={columns} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} rows={resultsData} groupByOptions={options} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} ref={this.props.groupByRef}/>
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
            return(<Results queryObj={this.props.queryObj} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} groupByRef={this.props.groupByRef}/>)
        }
    }
};


class QueryResults extends React.Component {
    render() {
        return (
            <div className="query-results-holder">
                <ResultsTable queryObj={this.props.queryObj} tabId={this.props.tabId} currentTab={this.props.currentTab} queryMongoId={this.props.queryMongoId} setGroupBy={this.props.setGroupBy} groupBy={this.props.groupBy} groupByRef={this.props.groupByRef}/>
            </div>
        );
    }
}

export default QueryResults;
