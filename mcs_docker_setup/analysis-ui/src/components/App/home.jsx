import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import HomeCharts from './homeCharts';

const historyFieldQueryName = "getHistorySceneFieldAggregation";

const history_field_aggregation = gql`
    query getHistorySceneFieldAggregation($fieldName: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName) 
  }`;

class HomePage extends React.Component {

    render() {
        return (
            <Query query={history_field_aggregation} variables={{"fieldName": "eval"}} fetchPolicy={'network-only'}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const evalOptions = data[historyFieldQueryName].sort();
                    let evaluationOptions = [];
                    for(let i=0; i < evalOptions.length; i++) {
                        evaluationOptions.push({value: evalOptions[i], label: evalOptions[i]});
                    }

                    return (
                        <HomeCharts evaluationOptions={evaluationOptions}/>
                    )
                }
            }
            </Query>
            
        );
    }
}

export default HomePage;