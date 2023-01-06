import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {Link} from 'react-router-dom';
import _ from "lodash";

const incorrectAllQueryName = "getIncorrectAllPerformers";
const getIncorrectAllPerformersQuery = gql`
    query getIncorrectAllPerformers($eval: String!, $categoryType: String!,$metadata: String!) {
        getIncorrectAllPerformers(eval: $eval, categoryType: $categoryType, metadata: $metadata) 
    }`;

class AllIncorrectScenes extends React.Component {

    getAnalysisPageURL = (item) => {
        return "/analysis?eval=" + this.props.state.eval + "&category_type=" + this.props.state.category + 
            "&test_num=" + item.test_num + "&scene=" + item.scene_num;
    }

    render() {
        return (
            <Query query={getIncorrectAllPerformersQuery} variables={{
                "eval": this.props.state.eval,
                "categoryType": this.props.state.category,
                "metadata": this.props.state.metadata}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const totalScenes = data[incorrectAllQueryName]["totalScenes"];
                    let incorrectAllSceneData = data[incorrectAllQueryName]["allIncorrectScenes"];
                    incorrectAllSceneData.sort((a, b) => (a.name > b.name) ? 1 : -1);

                    return (
                        <>
                        {incorrectAllSceneData.length > 0 &&
                            <div className="scorecard-holder">
                                <h4>Scenes Incorrect for All Performers: {_.startCase(this.props.state.category) + " (" + incorrectAllSceneData.length + "/" + totalScenes + ")"}</h4>
                                <div className="incorrect-scenes-grid">
                                    {incorrectAllSceneData.map((field, key) =>
                                        <div key={'all_incorrect_field_' + key}>
                                            <Link to={this.getAnalysisPageURL(field)} target="_blank">{'Test: ' + field.test_num + " Scene: " + field.scene_num}</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                        {incorrectAllSceneData.length === 0 &&
                            <div>There are no scenes that all the performers got incorrect.</div>
                        }
                        </>
                    )
                }
            }
            </Query>    
        );
    }
}

export default AllIncorrectScenes;
