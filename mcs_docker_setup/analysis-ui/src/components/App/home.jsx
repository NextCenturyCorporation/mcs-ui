import React from 'react';
import ResultsChart from './resultsChart';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

const homeStatsQuery = "getHomeStats";

const get_home_stats = gql`
    query getHomeStats{
        getHomeStats {
            statsByScore
            statsByTestType
            statsByScorePercent
        }
    }`;

class HomePage extends React.Component {

    constructor() {
        super();

        this.state = {
            totalPercentToggle: 'Test Type',
            numPercentToggle: 'number'
        }

        this.handlePassiveChange = this.handlePassiveChange.bind(this);
        this.handleNumPercentChange = this.handleNumPercentChange.bind(this);
    }

    handlePassiveChange(event) {
        this.setState({
            totalPercentToggle: event.target.value
        });
    }

    handleNumPercentChange(val) {
<<<<<<< HEAD
=======
        console.log(val);

>>>>>>> Add toggle for percent/number
        this.setState({
            numPercentToggle: val[1]
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

                        let scoreChartData = homeStats.statsByScore;
                        let passiveData = homeStats.statsByTestType.passiveCorrect;
                        let interactiveData = homeStats.statsByTestType.interactiveCorrect;

                        if(this.state.numPercentToggle === 'percent') {
                            scoreChartData = homeStats.statsByScorePercent;
                            passiveData = homeStats.statsByTestType.passiveCorrectPercent;
                            interactiveData = homeStats.statsByTestType.interactiveCorrectPercent;
                        }

                        // Values For By Scores Chart
                        const byScoreLength = scoreChartData.length - 1;
                        let byScoreKeys = Object.keys(scoreChartData[byScoreLength]);
                        byScoreKeys.shift();
                        const byScoreMaxValue = this.state.numPercentToggle === 'percent' ? 100 : scoreChartData[byScoreLength][byScoreKeys[0]] + scoreChartData[byScoreLength - 1][byScoreKeys[0]];

                        // Values for Test Type Interactive
                        const interactiveLength = interactiveData.length - 1;
                        let interactiveKeys = Object.keys(interactiveData[interactiveLength]);
                        interactiveKeys.shift();
                        const interactiveMaxValue = this.state.numPercentToggle === 'percent' ? 100 : homeStats.statsByTestType.interactiveTotal;

                        // Values for By Test Type
                        const passiveLength = passiveData.length - 1;
                        let passiveKeys = Object.keys(passiveData[passiveLength]);
                        passiveKeys.shift();
                        const passiveMaxValue = this.state.numPercentToggle === 'percent' ? 100 : homeStats.statsByTestType.passiveTotal;

                        return (
                            <div className="home-container">
                                <div className="home-navigation-container">
                                    <div className="evaluation-selector-container">
                                        Evaluation: "Evaluation Selector Here"
                                    </div>
                                    <div className="toggle-percent-number-container">
                                        <ToggleButtonGroup type="checkbox" value={this.state.numPercentToggle} onChange={this.handleNumPercentChange}>
                                            <ToggleButton variant="secondary" value={"number"}># Number</ToggleButton>
                                            <ToggleButton variant="secondary" value={"percent"}>% Percent</ToggleButton>
                                        </ToggleButtonGroup>
                                    </div>
                                </div>
                                <div className='chart-home-container'>
                                    <div className='chart-header'>
                                        <h4>Passive</h4> 
                                        <select className="form-control chart-selector" onChange={this.handlePassiveChange} value={this.state.totalPercentToggle}>
                                            <option>Test Type</option>
                                            <option>Plausibility</option>
                                        </select>
                                    </div>
                                    {this.state.totalPercentToggle === 'Plausibility' &&
                                        <ResultsChart chartKeys={byScoreKeys} chartData={scoreChartData} chartIndex={"score_type"} maxVal={byScoreMaxValue}/>
                                    }
                                    {this.state.totalPercentToggle === 'Test Type' &&
                                        <ResultsChart chartKeys={passiveKeys} chartData={passiveData} chartIndex={"test_type"} maxVal={passiveMaxValue}/>
                                    }
                                </div>

                                <div className='chart-home-container'>
                                    <div className='chart-header'>
                                        <h4>Interactive</h4> 
                                    </div>
                                    <ResultsChart chartKeys={interactiveKeys} chartData={interactiveData} chartIndex={"test_type"} maxVal={interactiveMaxValue}/>
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