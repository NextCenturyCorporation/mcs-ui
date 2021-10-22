import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import Select from 'react-select';
import ChartContainer from './chartContainer';

const evalTestTypes = "getEvalTestTypes";
const get_eval_test_types = gql`
    query getEvalTestTypes($eval: String!){
        getEvalTestTypes(eval: $eval) 
    }`;

const homeChartOptions = "getHomeChartOptions";
const get_home_chart_options = gql`
    query getHomeChartOptions($eval: String!, $evalType: String!){
        getHomeChartOptions(eval: $eval, evalType: $evalType) 
    }`;


class HomeCharts extends React.Component {

    constructor(props) {
        super();
        props.evaluationOptions.sort((a, b) => (a.label < b.label) ? 1 : -1)

        this.state = {
            numPercentToggle: 'number',
            currentEval: props.evaluationOptions[0]
        }

        this.handleNumPercentChange = this.handleNumPercentChange.bind(this);
        this.selectEvaluation = this.selectEvaluation.bind(this);
    }

    handleNumPercentChange(val) {
        if(val.length === 0) {
            return;
        }

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

    selectEvaluation(target){
        this.setState({
            currentEval: target
        });
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
                    <Query query={get_eval_test_types} variables={{"eval": this.state.currentEval.value}}>
                    {
                        ({ loading, error, data }) => {
                            if (loading) return <div></div> 
                            if (error) return <div>Error</div>

                            let testTypes = data[evalTestTypes].sort().reverse()
                            
                            return (
                                <div className='charts-container'>
                                    {
                                        testTypes.map(testType =>
                                            <Query query={get_home_chart_options} variables={
                                                {"eval": this.state.currentEval.value, "evalType": testType}} key={"home_chart_" + testType}>
                                            {
                                                ({ loading, error, data }) => {
                                                    if (loading) return <div>No stats yet</div> 
                                                    if (error) return <div>Error</div>

                                                    const chartOptions = data[homeChartOptions]

                                                    return (
                                                        <ChartContainer testType={testType} isPercent={this.state.numPercentToggle === 'percent'} 
                                                            eval={this.state.currentEval} chartOptions={chartOptions}/>

                                                    )
                                                }
                                            }
                                            </Query>
                                        )
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