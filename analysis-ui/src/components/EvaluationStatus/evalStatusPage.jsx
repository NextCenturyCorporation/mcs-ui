import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import EvalStatusTable from './evalStatusTable';

const sceneFieldQueryName = "getSceneFieldAggregation";

const scene_field_aggregation = gql`
    query getSceneFieldAggregation($fieldName: String!){
        getSceneFieldAggregation(fieldName: $fieldName) 
  }`;

class EvalStatusPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            counter: 0
        }
        this.incrementCounter = this.incrementCounter.bind(this);
    }

    incrementCounter() {
        this.setState({counter: this.state.counter + 1});
    }

    componentDidMount() {
        this.intervalMethod = setInterval(this.incrementCounter, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalMethod);
    }

    render() {
        return (
            <Query query={scene_field_aggregation} variables={{"fieldName": "eval"}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const evalOptions = data[sceneFieldQueryName].sort();
                    let evaluationOptions = [];
                    for(let i=0; i < evalOptions.length; i++) {
                        evaluationOptions.push({value: evalOptions[i], label: evalOptions[i]});
                    }

                    return (
                        <EvalStatusTable evaluationOptions={evaluationOptions} counter={this.state.counter} 
                            currentUser={this.props.currentUser}/>
                    )
                }
            }
            </Query>
        );
    }
}

export default EvalStatusPage;