import React from 'react';
import ResultsChart from './resultsChart';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import Select from 'react-select';

const homeStatsQuery = "getHomeStats";

const get_home_stats = gql`
    query getHomeStats($eval: String!){
        getHomeStats(eval: $eval) {
            stats,
            weightedStats,
            performers
        }
    }`;

class HomeCharts extends React.Component {

    constructor(props) {
        super();
        props.evaluationOptions.sort((a, b) => (a.label < b.label) ? 1 : -1)

        this.state = {
            numPercentToggle: 'number',
            currentEval: props.evaluationOptions[0],
            passiveToggle: {value: "passiveCorrect_passiveTotal_passiveCorrectPercent", label: "Total"},
            interactiveToggle: {value: "interactiveCorrect_interactiveTotal_interactiveCorrectPercent", label: "Total"},
            agentToggle: {value: "agentCorrect_agentTotal_agentCorrectPercent", label: "Total"},
            passiveWeightedToggle: 'weightedStats',
            agentsWeightedToggle: 'weightedStats'
        }

        this.handleNumPercentChange = this.handleNumPercentChange.bind(this);
        this.handlePassiveWeightedToggle = this.handlePassiveWeightedToggle.bind(this);
        this.selectEvaluation = this.selectEvaluation.bind(this);
        this.selectAgentToggle = this.selectAgentToggle.bind(this);
        this.selectInteractiveToggle = this.selectInteractiveToggle.bind(this);
        this.selectPassiveToggle = this.selectPassiveToggle.bind(this);
        this.handleAgentsWeightedToggle = this.handleAgentsWeightedToggle.bind(this);
    }

    handleNumPercentChange(val) {
        if(val.length === 0) {
            return;
        }

        this.setState({
            numPercentToggle: val[1]
        });
    }

    handlePassiveWeightedToggle(val) {
        if(val.length === 0) {
            return;
        }
        
        this.setState({
            passiveWeightedToggle: val[1]
        });
    }

    handleAgentsWeightedToggle(val) {
        if(val.length === 0) {
            return;
        }
        
        this.setState({
            agentsWeightedToggle: val[1]
        });
    }

    shouldComponentUpdate(nextProps, nextState) { 
        if (this.state === nextState) { 
          return false;
        }
        return true;
    }

    selectEvaluation(target){
        this.setState({
            currentEval: target
        });
    }

    selectAgentToggle(target) {
        this.setState({
            agentToggle: target
        });
    }

    selectInteractiveToggle(target) {
        this.setState({
            interactiveToggle: target
        });
    }

    selectPassiveToggle(target) {
        this.setState({
            passiveToggle: target
        });
    }

    checkDataForUndefined(data, performers) {
        for(let i=0; i < data.length; i++) {
            for(let j=0; j < performers.length; j++) {
                if(data[i][performers[j]] === undefined) {
                    data[i][performers[j]] = 0;
                }
            }
        }
        return data;
    }

    render() {
        return (
            <div className="home-container">
                <div className="home-navigation-container">
                    <div className="evaluation-selector-container">
                        <div className="evaluation-selector-label">Evaluation:</div>
                        <div className="evaluation-selector-holder">
                            <Select
                                onChange={this.selectEvaluation}
                                options={this.props.evaluationOptions}
                                defaultValue={this.state.currentEval}
                            />
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
                    <Query query={get_home_stats} variables={{"eval": this.state.currentEval.value}}>
                    {
                        ({ loading, error, data }) => {
                            if (loading) return <div>No stats yet</div> 
                            if (error) return <div>Error</div>
                            
                            let homeStats = data[homeStatsQuery];

                            let passiveOptions = [], interactiveOptions = [], agentOptions = [];

                            // Build Passive Options Drop Down
                            if(homeStats[this.state.passiveWeightedToggle].passiveTotal > 0) {
                                passiveOptions.push({value: "passiveCorrect_passiveTotal_passiveCorrectPercent", label: "Total"});
                                passiveOptions.push({value: "plausibleTotal_null_plausiblePercentTotal", label: "Total by Plausibility"});
                            }
                            if (homeStats[this.state.passiveWeightedToggle].passiveTotalMetadata1 > 0) {
                                passiveOptions.push({value: "passiveCorrectMetadata1_passiveTotalMetadata1_passiveCorrectPercentMetadata1", label: "Metadata 1"});
                                passiveOptions.push({value: "plausibleMetadata1_null_plausiblePercentMetadata1", label: "Metadata 1 by Plausibility"});
                            }
                            if (homeStats[this.state.passiveWeightedToggle].passiveTotalMetadata2 > 0) {
                                passiveOptions.push({value: "passiveCorrectMetadata2_passiveTotalMetadata2_passiveCorrectPercentMetadata2", label: "Metadata 2"});
                                passiveOptions.push({value: "plausibleMetadata2_null_plausiblePercentMetadata2", label: "Metadata 2 by Plausibility"});
                            }
                            if (homeStats[this.state.passiveWeightedToggle].passiveTotalOracle> 0) {
                                passiveOptions.push({value: "passiveCorrectOracle_passiveTotalOracle_passiveCorrectPercentOracle", label: "Oracle"});
                                passiveOptions.push({value: "plausibleOracle_null_plausiblePercentOracle", label: "Oracle by Plausibility"});
                            }

                            // Build Interactive Options Drop Down
                            if(homeStats.stats.interactiveTotal > 0) {
                                interactiveOptions.push({value: "interactiveCorrect_interactiveTotal_interactiveCorrectPercent", label: "Total"});
                            }
                            if (homeStats.stats.interactiveTotalMetadata1 > 0) {
                                interactiveOptions.push({value: "interactiveCorrectMetadata1_interactiveTotalMetadata1_interactiveCorrectPercentMetadata1", label: "Metadata 1"});
                            }
                            if (homeStats.stats.interactiveTotalMetadata2 > 0) {
                                interactiveOptions.push({value: "interactiveCorrectMetadata2_interactiveTotalMetadata2_interactiveCorrectPercentMetadata2", label: "Metadata 2"});
                            }

                            // Build Agent Options Drop Down
                            if(homeStats[this.state.agentsWeightedToggle].agentTotal > 0) {
                                agentOptions.push({value: "agentCorrect_agentTotal_agentCorrectPercent", label: "Total"});
                                agentOptions.push({value: "expectedTotal_null_expectedPercentTotal", label: "Total by Expected"});
                            }
                            if (homeStats[this.state.agentsWeightedToggle].agentTotalMetadata1 > 0) {
                                agentOptions.push({value: "agentCorrectMetadata1_agentTotalMetadata1_agentCorrectPercentMetadata1", label: "Metadata 1"});
                                agentOptions.push({value: "expectedMetadata1_null_expectedPercentMetadata1", label: "Metadata 1 by Expected"});
                            }
                            if (homeStats[this.state.agentsWeightedToggle].agentTotalMetadata2 > 0) {
                                agentOptions.push({value: "agentCorrectMetadata2_agentTotalMetadata2_agentCorrectPercentMetadata2", label: "Metadata 2"});
                                agentOptions.push({value: "expectedMetadata2_null_expectedPercentMetadata2", label: "Metadata 2 by Expected"});
                            }

                            // Might need to revisit using the dropdown and splits this way.
                            const passiveSplit = this.state.passiveToggle.value.split("_");
                            let passiveData = homeStats[this.state.passiveWeightedToggle][passiveSplit[0]];

                            const interactiveSplit = this.state.interactiveToggle.value.split("_");
                            let interactiveData = homeStats.stats[interactiveSplit[0]];

                            const agentSplit = this.state.agentToggle.value.split("_");
                            let agentData = homeStats[this.state.agentsWeightedToggle][agentSplit[0]];

                            //
                            let passiveLegendLabel = "Number of Correct Tests";
                            let interactiveLegendLabel = "Number Goal Achieved Tests";
                            let agentLegendLabel = "Number of Correct Tests";

                            if(this.state.numPercentToggle === 'percent') {
                                passiveData = homeStats[this.state.passiveWeightedToggle][passiveSplit[2]];
                                interactiveData = homeStats.stats[interactiveSplit[2]];
                                agentData = homeStats[this.state.agentsWeightedToggle][agentSplit[2]];

                                passiveLegendLabel = "% Correct Tests";
                                interactiveLegendLabel = "% Goal Achieved Tests";
                                agentLegendLabel = "% Correct Tests";
                            }

                            // Values for By Test Type
                            const passiveLength = passiveData.length - 1;
                            let passiveKeys = Object.keys(passiveData[passiveLength]);
                            passiveKeys.shift();
                            let passiveMaxValue;
                            if(passiveSplit[1] === "null") {
                                passiveLegendLabel = this.state.numPercentToggle === 'percent' ? "% Plausibility Tests" : "Number of Plausibility Tests";
                                passiveMaxValue = this.state.numPercentToggle === 'percent' ? 100 : passiveData[passiveLength][passiveKeys[0]] + passiveData[passiveLength - 1][passiveKeys[0]];
                            } else {
                                passiveMaxValue = this.state.numPercentToggle === 'percent' ? 100 : homeStats[this.state.passiveWeightedToggle][passiveSplit[1]];
                            } 

                            // Values for Interactive
                            const interactiveLength = interactiveData.length - 1;
                            let interactiveKeys = Object.keys(interactiveData[interactiveLength]);
                            interactiveKeys.shift();
                            const interactiveMaxValue = this.state.numPercentToggle === 'percent' ? 100 : homeStats.stats[interactiveSplit[1]];

                            // Values for Agent
                            const agentLength = agentData.length - 1;
                            let agentKeys = Object.keys(agentData[agentLength]);
                            agentKeys.shift();
                            let agentMaxValue;
                            if(agentSplit[1] === "null") {
                                agentLegendLabel = this.state.numPercentToggle === 'percent' ? "% Expectness Tests" : "Number of Expectness Tests";
                                agentMaxValue = this.state.numPercentToggle === 'percent' ? 100 : agentData[agentLength][agentKeys[0]] + agentData[agentLength - 1][agentKeys[0]];
                            } else {
                                agentMaxValue = this.state.numPercentToggle === 'percent' ? 100 : homeStats[this.state.agentsWeightedToggle][agentSplit[1]];
                            } 

                            return (
                                <div className='charts-container'>
                                    <div className='chart-home-container'>
                                        <div className='chart-header'>
                                            <div className='chart-header-label'>
                                                <h4>Passive</h4>
                                            </div>
                                            <div className='chart-header-select'>
                                                <Select
                                                    onChange={this.selectPassiveToggle}
                                                    options={passiveOptions}
                                                    defaultValue={this.state.passiveToggle}
                                                />
                                            </div>
                                            <div className="chart-weight-toggle">
                                                <ToggleButtonGroup type="checkbox" value={this.state.passiveWeightedToggle} onChange={this.handlePassiveWeightedToggle}>
                                                    <ToggleButton variant="secondary" value={"weightedStats"}>Weighted</ToggleButton>
                                                    <ToggleButton variant="secondary" value={"stats"}>Unweighted</ToggleButton>
                                                </ToggleButtonGroup>
                                            </div>
                                        </div>
                                        <ResultsChart chartKeys={passiveKeys} chartData={this.checkDataForUndefined(passiveData, homeStats.performers)} chartIndex={"test_type"} maxVal={passiveMaxValue} legendLabel={passiveLegendLabel}/>
                                    </div>

                                    {interactiveOptions.length > 0 && 
                                        <div className='chart-home-container'>
                                            <div className='chart-header'>
                                                <div className='chart-header-label'>
                                                    <h4>Interactive</h4>
                                                </div>
                                                <div className='chart-header-select'>
                                                    <Select
                                                        onChange={this.selectInteractiveToggle}
                                                        options={interactiveOptions}
                                                        defaultValue={this.state.interactiveToggle}
                                                    />
                                                </div>
                                            </div>
                                            <ResultsChart chartKeys={interactiveKeys} chartData={interactiveData} chartIndex={"test_type"} maxVal={interactiveMaxValue} legendLabel={interactiveLegendLabel}/>
                                        </div>
                                    }

                                    {agentOptions.length > 0 && 
                                        <div className='chart-home-container'>
                                            <div className='chart-header'>
                                                <div className='chart-header-label'>
                                                    <h4>Agents</h4>
                                                </div>
                                                <div className='chart-header-select'>
                                                    <Select
                                                        onChange={this.selectAgentToggle}
                                                        options={agentOptions}
                                                        defaultValue={this.state.agentToggle}
                                                    />
                                                </div>
                                                <div className="chart-weight-toggle">
                                                    <ToggleButtonGroup type="checkbox" value={this.state.agentsWeightedToggle} onChange={this.handleAgentsWeightedToggle}>
                                                        <ToggleButton variant="secondary" value={"weightedStats"}>Paired</ToggleButton>
                                                        <ToggleButton variant="secondary" value={"stats"}>Unpaired</ToggleButton>
                                                    </ToggleButtonGroup>
                                                </div>
                                            </div>
                                            <ResultsChart chartKeys={agentKeys} chartData={agentData} chartIndex={"test_type"} maxVal={agentMaxValue} legendLabel={agentLegendLabel}/>
                                        </div>
                                    }
                                </div>
                            )
                        }
                    }
                </Query>
            }
        </div>
            
        );
    }
}

export default HomeCharts;