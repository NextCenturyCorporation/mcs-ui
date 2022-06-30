import React from 'react';
import EvalNavItem from './evalNavItem';
import CategoryNavItem from './categoryNavItem';
import ButtonGroupNavItem from './buttonGroupNavItem';
import HyperCubeResultsTable from './hypercubeResultsTable';
import Switch from "react-switch";

class TestOverview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            eval: "",
            category: "",
            performer: "",
            metadata: "",
            useDidNotAnswer: true,
            weightedPassing: true
        }
        this.stateUpdateHandler = this.stateUpdateHandler.bind(this);
        this.toggleUseDidNotAnswer = this.toggleUseDidNotAnswer.bind(this);
        this.toggleWeightedPassing = this.toggleWeightedPassing.bind(this);
    }

    stateUpdateHandler(key, value) {
        this.setState({[key]: value});
    }

    toggleUseDidNotAnswer() {
        this.setState(prevState => ({useDidNotAnswer: !prevState.useDidNotAnswer}));
    }

    toggleWeightedPassing() {
        this.setState(prevState => ({weightedPassing: !prevState.weightedPassing}));
    }

    render() {
        return (
            <div className="layout">
                <div className="layout-board">
                    <div className="nav-section">
                        <div className="nav-header">
                            <span className="nav-header-text">Evaluation</span>
                        </div>
                        <div className="nav-menu">
                            <EvalNavItem state={this.state} stateUpdateHandler={this.stateUpdateHandler}/>
                        </div>
                        {this.state.eval !== "" &&
                            <>
                                <div className="nav-header">
                                    <span className="nav-header-text">Category</span>
                                </div>
                                <div className="nav-menu">
                                    <CategoryNavItem state={this.state} stateUpdateHandler={this.stateUpdateHandler}/>
                                </div>
                            </>
                        }
                    </div>
                    <div className="test-overview-area">
                        {(this.state.eval !== "" && this.state.category !== "") &&
                            <>
                                <div className="overview-button-group-holder">
                                    <div>
                                        <ButtonGroupNavItem fieldName="performer" state={this.state} stateUpdateHandler={this.stateUpdateHandler}/>
                                    </div>
                                    <div className="overview-buttom-group-right">
                                        <label className="no-answer-toggle-holder">
                                            <div className="switch-container">
                                                <Switch onChange={this.toggleWeightedPassing} checked={this.state.weightedPassing}/>
                                            </div>
                                            <span>Passing/Weighted Scoring</span>
                                        </label>
                                        <label className="no-answer-toggle-holder">
                                            <div className="switch-container">
                                                <Switch onChange={this.toggleUseDidNotAnswer} checked={this.state.useDidNotAnswer}/>
                                            </div>
                                            <span>Include No Answers in Calculations</span>
                                        </label>
                                        <ButtonGroupNavItem fieldName="metadata" state={this.state} stateUpdateHandler={this.stateUpdateHandler}/>
                                    </div>
                                </div>
                                
                                {(this.state.performer !== "" && this.state.metadata !== "") &&
                                    <div className="overview-table-container">
                                        <HyperCubeResultsTable state={this.state}/>
                                    </div>
                                }
                            </>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default TestOverview;