import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from "lodash";

const complexQueryName = "createComplexQuery";
const scenesCollectionName = "mcsScenes";

const excludeFields = ["steps", "scene"]

const create_complex_query = gql`
    query createComplexQuery($queryObject: JSON!) {
        createComplexQuery(queryObject: $queryObject) 
    }`;

const Results = ({queryObj}) => {
    const checkKeyExcludedHeader = (objectKey, key) => {
        if(!excludeFields.includes(objectKey)) {
            return <th key={'results_column_header_' + key}>{objectKey}</th>;
        }
    }
    
    const checkKeyExcludedCell = (objectKey, key, objKey, resultObj) => {
        if(!excludeFields.includes(objectKey)) {
            return <td key={'results_' + key + "_" + objKey}>{JSON.stringify(resultObj[objectKey])}</td>;
        }
    }

    return (
        <Query query={create_complex_query} variables={{"queryObject": queryObj}} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Results are currently loading ... </div> 
                if (error) return <div>Error</div>
                
                let resultsData = data[complexQueryName];

                console.log(resultsData);

                if(resultsData.length === 0) {
                    return (
                        <div>No Results</div>
                    );
                } else {
                    return (
                        <div>
                            <table border="1">
                                <thead>
                                    <tr>
                                        {Object.keys(resultsData[0]).map((objectKey, key) => 
                                            checkKeyExcludedHeader(objectKey, key))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultsData.map((resultObj, key) => 
                                        <tr className="result-row" key={'result_row_' + key}>
                                            {Object.keys(resultObj).map((objectKey, objKey) => 
                                                checkKeyExcludedCell(objectKey, key, objKey, resultObj))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );
                }
            }
        }
        </Query>
    );
}

const ResultsTable =({queryObj}) => {
    if(_.isEmpty(queryObj)) {
        return(<div>Enter some parameters to see query results.</div>);
    } else {
        return(<Results queryObj={queryObj}/>)
    }
};


class QueryResults extends React.Component {

    render() {
        return (
            <div className="query-results-holder">
                <h4>Query Results</h4>
                <ResultsTable queryObj={this.props.queryObj}/>
            </div>
        );
    }
}

export default QueryResults;