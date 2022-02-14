import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import HomeCharts from './homeCharts';

const historyFieldQueryName = "getHistoryCollectionMapping";

const history_field_aggregation = gql`
    query getHistoryCollectionMapping{
        getHistoryCollectionMapping
  }`;

class HomePage extends React.Component {

    render() {
        return (
            <Query query={history_field_aggregation}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const evalOptions = data[historyFieldQueryName].sort();

                    return (
                        <HomeCharts evaluationOptions={evalOptions}/>
                    )
                }
            }
            </Query>
            
        );
    }
}

export default HomePage;