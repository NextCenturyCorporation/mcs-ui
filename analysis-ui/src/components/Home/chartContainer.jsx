import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import ResultsChart from './resultsChart';

const getHomeChart = "getHomeChart";
const get_home_chart = gql`
    query getHomeChart($eval: String!, $evalType: String!, $isPercent: Boolean, $metadata: String!, $isPlausibility: Boolean, 
                $isNovelty: Boolean, $isWeighted: Boolean, $useDidNotAnswer: Boolean){
        getHomeChart(eval: $eval, evalType: $evalType, isPercent: $isPercent, metadata: $metadata, isPlausibility: $isPlausibility, 
            isNovelty: $isNovelty, isWeighted: $isWeighted, useDidNotAnswer: $useDidNotAnswer) 
    }`;

class ChartContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            chartOption: props.chartOptions[0],
            metadata: this.getMetadataLevel(props.chartOptions[0]),
            isPlausibility: this.getPlausibility(props.chartOptions[0]),
            isNovelty: this.getNovelty(props.chartOptions[0]),
            isWeighted: this.props.testType.toLowerCase() === 'interactive'? false : true
        }

        this.toggleChartOptions = this.toggleChartOptions.bind(this);
        this.handleWeightedToggle = this.handleWeightedToggle.bind(this);
    }

    getMetadataLevel(valueToCheck) {
        const optionArray = valueToCheck.value.toLowerCase().split("by");
        return optionArray[0];
    }

    getPlausibility(valueToCheck) {
        if(valueToCheck.value.toLowerCase().indexOf("expected") > 0 || valueToCheck.value.toLowerCase().indexOf("plausibility") > 0) {
            return true;
        } else {
            return false;
        }
    }

    getNovelty(valueToCheck) {
        if(valueToCheck.value.toLowerCase().indexOf("novelty") > 0) {
            return true;
        } else {
            return false;
        }
    }

    toUpperFirstLetters(testType) {
        const testTypeArray = testType.split(" ");
        for (let i = 0; i < testTypeArray.length; i++) {
            testTypeArray[i] = testTypeArray[i].charAt(0).toUpperCase() + testTypeArray[i].slice(1);
        }
        return testTypeArray.join(" ");
    }

    toggleChartOptions(target) {
        this.setState({
            chartOption: target,
            metadata: this.getMetadataLevel(target),
            isPlausibility: this.getPlausibility(target),
            isNovelty: this.getNovelty(target)
        });
    }

    getMaxChartValue(numTotal) {
        return this.props.isPercent ? 100 : numTotal;
    }

    getChartKeys(chartData) {
        const dataLength = chartData.length - 1;
        let chartKeys = Object.keys(chartData[dataLength]);
        chartKeys.shift();
        return chartKeys;
    }

    getChartLegendLabel() {
        let numPercentLabel = this.props.isPercent ? "% " : "Number of ";
        let testLabel = this.props.testType.toLowerCase() === 'interactive' ? "Goal Achieved " : "Correct ";

        if(this.state.isPlausibility) {
            testLabel = this.props.testType.toLowerCase() === 'agents' ? "Expectness " : "Plausibility ";
        }

        if(this.state.isNovelty) {
            testLabel = "Novelty ";
        }

        return numPercentLabel + testLabel + "Tests";
    }

    checkDataForUndefined(data, performers) {
        if(data === null || data === undefined) {
            return [];
        }

        for(let i=0; i < data.length; i++) {
            for(let j=0; j < performers.length; j++) {
                if(data[i][performers[j]] === undefined) {
                    data[i][performers[j]] = 0;
                }
            }
        }
        return data;
    }

    handleWeightedToggle(val) {
        if(val.length === 0) {
            return;
        }
        
        this.setState({
            isWeighted: val[1]
        });
    }

    render() {
        return (
            <div className='chart-home-container'>
                <div className='chart-header'>
                    <div className='chart-header-label'>
                        <h4>{this.toUpperFirstLetters(this.props.testType)}</h4>
                    </div>
                    <div className='chart-header-select'>
                        <Select
                            onChange={this.toggleChartOptions}
                            options={this.props.chartOptions}
                            defaultValue={this.state.chartOption}
                        />
                    </div>
                    {this.props.testType.toLowerCase() === 'intuitive physics' &&
                        <div className="chart-weight-toggle">
                            <ToggleButtonGroup type="checkbox" value={this.state.isWeighted} onChange={this.handleWeightedToggle}>
                                <ToggleButton variant="secondary" value={true}>{this.props.testType.toLowerCase() === 'agents' ? 'Paired' : 'Weighted'}</ToggleButton>
                                <ToggleButton variant="secondary" value={false}>{this.props.testType.toLowerCase() === 'agents' ? 'Unpaired' : 'Unweighted'}</ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                    }
                </div>
                <Query query={get_home_chart} variables={{
                        "eval": this.props.eval.value,
                        "evalType": this.props.testType,
                        "isPercent": this.props.isPercent,
                        "metadata": this.state.metadata,
                        "isPlausibility": this.state.isPlausibility,
                        "isNovelty": this.state.isNovelty,
                        "isWeighted": this.state.isWeighted,
                        "useDidNotAnswer": this.props.useDidNotAnswer}}>
                    {
                        ({ loading, error, data }) => {
                            if (loading) return <div></div> 
                            if (error) return <div>Error</div>

                            let chartData = data[getHomeChart]
                            const performers = this.getChartKeys(chartData.data);

                            return (
                                <ResultsChart chartKeys={performers} chartData={this.checkDataForUndefined(chartData.data, performers)} 
                                    chartIndex={"test_type"} maxVal={this.getMaxChartValue(chartData.total)} legendLabel={this.getChartLegendLabel()} 
                                    isPercent={this.props.isPercent} incorrectData={this.checkDataForUndefined(chartData.incorrectData, performers)}/>
                            )
                        }
                    }
                </Query>
            </div>
        );
    }
}

export default ChartContainer;