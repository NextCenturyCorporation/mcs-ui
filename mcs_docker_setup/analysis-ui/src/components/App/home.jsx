import React from 'react';
import ResultsChart from './resultsChart';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

const homeStatsQuery = "getHomeStats";
const historyFieldQueryName = "getHistorySceneFieldAggregation";

const get_home_stats = gql`
    query getHomeStats($eval: String!){
        getHomeStats(eval: $eval) {
            statsByScore
            statsByTestType
            statsByScorePercent
        }
    }`;

const history_field_aggregation = gql`
    query getHistorySceneFieldAggregation($fieldName: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName) 
  }`;

class HomePage extends React.Component {

    constructor() {
        super();

        this.state = {
            totalPercentToggle: 'Test Type',
            numPercentToggle: 'number',
            currentEval: ''
        }

        this.handlePassiveChange = this.handlePassiveChange.bind(this);
        this.handleNumPercentChange = this.handleNumPercentChange.bind(this);
        this.selectEvaluation = this.selectEvaluation.bind(this);
    }

    handlePassiveChange(event) {
        this.setState({
            totalPercentToggle: event.target.value
        });
    }

    handleNumPercentChange(val) {
        this.setState({
            numPercentToggle: val[1]
        });
    }

    shouldComponentUpdate(nextProps, nextState) { 
        if (this.state === nextState) { 
          return false;
        }
        return true;
    }

    selectEvaluation(event) {
        this.setState({
            currentEval: event.target.value
        });
    }

    render() {
        return (
            <Query query={history_field_aggregation} variables={{"fieldName": "eval"}} fetchPolicy={'network-only'}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const evalOptions = data[historyFieldQueryName].sort();
                    const defaultOption = evalOptions[0];

                    if(this.state.currentEval === '') {
                        this.setState({currentEval: defaultOption});
                    }

                    return (
                        <div className="home-container">
                            <div className="home-navigation-container">
                                <div className="evaluation-selector-container">
                                    <div>Evaluation:</div>
                                    <div>
                                        <select id="evalSelector" className="form-control eval-selector" onChange={this.selectEvaluation} value={this.state.currentEval}>
                                            {evalOptions.map((evalOption, key) =>
                                                <option key={"option" + key}>{evalOption}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="toggle-percent-number-container">
                                    <ToggleButtonGroup type="checkbox" value={this.state.numPercentToggle} onChange={this.handleNumPercentChange}>
                                        <ToggleButton variant="secondary" value={"number"}># Number</ToggleButton>
                                        <ToggleButton variant="secondary" value={"percent"}>% Percent</ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                            </div>
                            {this.state.currentEval !== '' &&
                                <Query query={get_home_stats} variables={{"eval": this.state.currentEval}} fetchPolicy={'network-only'}>
                                {
                                    ({ loading, error, data }) => {
                                        if (loading) return <div>No stats yet</div> 
                                        if (error) return <div>Error</div>
                                        
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
                                            <div>
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
                        }
                    </div>
                    )
                }
            }
            </Query>
            
        );
    }
}

export default HomePage;