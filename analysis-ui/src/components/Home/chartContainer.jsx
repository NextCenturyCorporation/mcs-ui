import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import ResultsChart from './resultsChart';

const getHomeChart = "getHomeChart";
const get_home_chart = gql`
    query getHomeChart($eval: String!, $evalType: String!, $isPercent: Boolean, $metadata: String!, $isPlausibility: Boolean, $isWeighted: Boolean){
        getHomeChart(eval: $eval, evalType: $evalType, isPercent: $isPercent, metadata: $metadata, isPlausibility: $isPlausibility, isWeighted: $isWeighted) 
    }`;

class ChartContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            chartOption: props.chartOptions[0],
            metadata: this.getMetadataLevel(props.chartOptions[0]),
            isPlausibility: this.getPlausibility(props.chartOptions[0]),
            isWeighted: false
        }
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
            isPlausibility: this.getPlausibility(target)
        });
    }

    getMaxChartValue(numTotal) {
        console.log("getMaxChartValue", numTotal);
        return this.props.isPercent ? 100 : numTotal;
    }

    getChartKeys(chartData) {
        const dataLength = chartData.length - 1;
        let chartKeys = Object.keys(chartData[dataLength]);
        chartKeys.shift();
        return chartKeys;
    }

    getChartLegendLabel() {
        if(this.props.testType.toLowerCase() === 'agents') {
            if(this.props.isPlausibility) {
                return this.props.isPercent ? "% Expectness Tests" : "Number of Expectness Tests";
            } else {
                return this.props.isPercent ? "% Correct Tests" : "Number of Correct Tests";
            }
        } else if(this.props.testType.toLowerCase() === 'interactive') {
            return this.props.isPercent ? "% Goal Achieved Tests" : "Number Goal Achieved Tests";
        } else {
            if(this.props.isPlausibility) {
                return this.props.isPercent ? "% Plausibility Tests" : "Number of Plausibility Tests";
            } else {
                return this.props.isPercent ? "% Correct Tests" : "Number of Correct Tests";
            }
        }
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
                </div>
                <Query query={get_home_chart} variables={{
                        "eval": this.props.eval.value,
                        "evalType": this.props.testType,
                        "isPercent": this.props.isPercent,
                        "metadata": this.state.metadata,
                        "isPlausibility": this.state.isPlausibility,
                        "isWeighted": this.state.isWeighted}}>
                    {
                        ({ loading, error, data }) => {
                            if (loading) return <div>No stats yet</div> 
                            if (error) return <div>Error</div>

                            let chartData = data[getHomeChart]
                            const performers = this.getChartKeys(chartData.data);

                            console.log("chartData", chartData);

                            return (
                                <ResultsChart chartKeys={performers} chartData={this.checkDataForUndefined(chartData.data, performers)} 
                                    chartIndex={"test_type"} maxVal={this.getMaxChartValue(chartData.total)} legendLabel={this.getChartLegendLabel()}/>
                            )
                        }
                    }
                </Query>
            </div>
        );
    }
}

export default ChartContainer;