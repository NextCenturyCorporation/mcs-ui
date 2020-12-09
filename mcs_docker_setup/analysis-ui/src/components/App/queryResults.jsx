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

const convertToMongoQuery = function(queryObj) {
    let mongoQuery = {};
    for(const queryKey in queryObj) {
       if(queryObj[queryKey]["fieldType"].toLowerCase() === 'scene') {
           mongoQuery[scenesCollectionName + "." + queryObj[queryKey]["fieldName"]] = queryObj[queryKey]["fieldValue"];
       } else {
           mongoQuery[queryObj[queryKey]["fieldName"]] = queryObj[queryKey]["fieldValue"];
       }
    }

    return mongoQuery;
}

const Results = ({queryObj}) => {
    const mongoQuerySyntax = convertToMongoQuery(queryObj);

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
        <Query query={create_complex_query} variables={{"queryObject": mongoQuerySyntax}} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>No comments yet</div> 
                if (error) return <div>Error</div>
                
                console.log(data);
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
        return(<div>Select a query to search, to see results.</div>);
    } else {
        return(<Results queryObj={queryObj}/>)
    }
};


class QueryResults extends React.Component {

    render() {
        return (
            <div>
                <h4>Query Results</h4>
                <ResultsTable queryObj={this.props.queryObj}/>
            </div>
        );
    }
}

export default QueryResults;