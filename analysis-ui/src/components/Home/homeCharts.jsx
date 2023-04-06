import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import Select from 'react-select';
import ChartContainer from './chartContainer';
import Switch from "react-switch";

const evalDomainTypes = "getEvalDomainTypes";
const get_eval_domain_types = gql`
    query getEvalDomainTypes($eval: String!){
        getEvalDomainTypes(eval: $eval) 
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
            currentEval: props.evaluationOptions[0],
            useDidNotAnswer: true
        }

        this.handleNumPercentChange = this.handleNumPercentChange.bind(this);
        this.selectEvaluation = this.selectEvaluation.bind(this);
        this.toggleUseDidNotAnswer = this.toggleUseDidNotAnswer.bind(this);
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

    toggleUseDidNotAnswer() {
        this.setState(prevState => ({useDidNotAnswer: !prevState.useDidNotAnswer}));
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
                        <label className="no-answer-toggle-holder">
                            <div className="switch-container">
                                <Switch onChange={this.toggleUseDidNotAnswer} checked={this.state.useDidNotAnswer}/>
                            </div>
                            <span>Include No Answers in Calculations</span>
                        </label>
                        <ToggleButtonGroup type="checkbox" value={this.state.numPercentToggle} onChange={this.handleNumPercentChange}>
                            <ToggleButton variant="secondary" value={"number"}># Number</ToggleButton>
                            <ToggleButton variant="secondary" value={"percent"}>% Percent</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </div>
                {this.state.currentEval !== '' &&
                    <Query query={get_eval_domain_types} variables={{"eval": this.state.currentEval.value}}>
                    {
                        ({ loading, error, data }) => {
                            if (loading) return <div></div> 
                            if (error) return <div>Error</div>

                            let domainTypes = data[evalDomainTypes];
                            domainTypes.sort();
                            
                            return (
                                <div className='charts-container'>
                                    {
                                        domainTypes.map(domainType =>
                                            <Query query={get_home_chart_options} variables={
                                                {"eval": this.state.currentEval.value, "evalType": domainType}} key={"home_chart_" + domainType}>
                                            {
                                                ({ loading, error, data }) => {
                                                    if (loading) return <div>No stats yet</div> 
                                                    if (error) return <div>Error</div>

                                                    const chartOptions = data[homeChartOptions]

                                                    return (
                                                        <ChartContainer domainType={domainType} isPercent={this.state.numPercentToggle === 'percent'} 
                                                            eval={this.state.currentEval} chartOptions={chartOptions} useDidNotAnswer={this.state.useDidNotAnswer}/>

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