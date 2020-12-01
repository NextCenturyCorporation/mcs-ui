import React from 'react';
import ResultsChart from './resultsChart';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
//import $ from 'jquery';
//import _ from "lodash";

const homeStatsQuery = "getHomeStats";

const get_home_stats = gql`
    query getHomeStats{
        getHomeStats {
            statsByScore
            statsByTestType
        }
    }`;

class HomePage extends React.Component {

    constructor() {
        super();

        this.state = {
            totalPercentToggle: 'Plausibility'
        }

        this.handlePassiveChange = this.handlePassiveChange.bind(this);
    }

    handlePassiveChange(event) {
        this.setState({
            totalPercentToggle: event.target.value
        });
    }

    render() {
        return (
            <Query query={get_home_stats} fetchPolicy={'network-only'}>
                {
                    ({ loading, error, data }) => {
                        if (loading) return <div>No stats yet</div> 
                        if (error) return <div>Error</div>
                        
                        console.log(data[homeStatsQuery]);
                        let homeStats = data[homeStatsQuery];

                        // Values For By Scores Chart
                        const byScoreLength = homeStats.statsByScore.length - 1;
                        let byScoreKeys = Object.keys(homeStats.statsByScore[byScoreLength]);
                        byScoreKeys.shift();
                        const byScoreMaxValue = homeStats.statsByScore[byScoreLength][byScoreKeys[0]] + homeStats.statsByScore[byScoreLength - 1][byScoreKeys[0]];

                        // Values for Test Type Interactive
                        const interactiveLength = homeStats.statsByTestType.interactiveTotal.length - 1;
                        let interactiveKeys = Object.keys(homeStats.statsByTestType.interactiveTotal[interactiveLength]);
                        interactiveKeys.shift();
                        const interactiveMaxValue = homeStats.statsByTestType.interactiveTotal[interactiveLength][interactiveKeys[0]];

                        // Values for By Test Type
                        const passiveLength = homeStats.statsByTestType.passiveTotal.length - 1;
                        let passiveKeys = Object.keys(homeStats.statsByTestType.passiveTotal[passiveLength]);
                        passiveKeys.shift();
                        const passiveMaxValue = homeStats.statsByTestType.passiveTotal[passiveLength][passiveKeys[0]];

                        return (
                            <div className="home-container">
                                <div>
                                    Evaluation Chooser %/Num Chooser
                                </div>
                                <div className='chart-home-container'>
                                    <div className='chart-header'>
                                        <h4>Passive</h4> 
                                        <select className="form-control chart-selector" onChange={this.handlePassiveChange}>
                                            <option>Plausibility</option>
                                            <option>Test Type</option>
                                        </select>
                                    </div>
                                    {this.state.totalPercentToggle === 'Plausibility' &&
                                        <ResultsChart chartKeys={byScoreKeys} chartData={homeStats.statsByScore} chartIndex={"score_type"} maxVal={byScoreMaxValue}/>
                                    }
                                    {this.state.totalPercentToggle === 'Test Type' &&
                                        <ResultsChart chartKeys={passiveKeys} chartData={homeStats.statsByTestType.passiveCorrect} chartIndex={"test_type"} maxVal={passiveMaxValue}/>
                                    }
                                </div>

                                <div className='chart-home-container'>
                                    <div className='chart-header'>
                                        <h4>Interactive</h4> 
                                    </div>
                                    <ResultsChart chartKeys={interactiveKeys} chartData={homeStats.statsByTestType.interactiveCorrect} chartIndex={"test_type"} maxVal={interactiveMaxValue}/>
                                </div>
                            </div>
                        )
                    }
                }
            </Query>
        );
    }
}

export default HomePage;