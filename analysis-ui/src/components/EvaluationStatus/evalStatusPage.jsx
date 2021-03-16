import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import EvalStatusTable from './evalStatusTable';

const historyFieldQueryName = "getHistorySceneFieldAggregation";

const history_field_aggregation = gql`
    query getHistorySceneFieldAggregation($fieldName: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName) 
  }`;

class EvalStatusPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentEval: "",
        }

        this.selectEvaluation = this.selectEvaluation.bind(this);
    }

    selectEvaluation(val) {
        console.log(val);
    }

    render() {
        return (
            <Query query={history_field_aggregation} variables={{"fieldName": "eval"}}>
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
                        <EvalStatusTable evaluationOptions={evaluationOptions}/>
                    )
                }
            }
            </Query>
        );
    }
}

export default EvalStatusPage;