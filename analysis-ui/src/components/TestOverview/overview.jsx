import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import EvalNavItem from './evalNavItem';
import CategoryNavItem from './categoryNavItem';
import ButtonGroupNavItem from './buttonGroupNavItem';
import HyperCubeResultsTable from './hypercubeResultsTable';
import Switch from "react-switch";
import ScoreCardTable from './scorecardTable';
import AllIncorrectScenes from './allIncorrectScenes';

const getTestTypeQueryName = "getTestTypeOverviewData";
const getTestTypeOverviewData = gql`
    query getTestTypeOverviewData($eval: String!, $categoryType: String!) {
        getTestTypeOverviewData(eval: $eval, categoryType: $categoryType) 
    }`;
class TestOverview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            eval: "",
            category: "",
            performer: "",
            metadata: "",
            useDidNotAnswer: true,
            weightedPassing: true,
            currentTab: "HyperCubeId"
        }
        this.stateUpdateHandler = this.stateUpdateHandler.bind(this);
        this.toggleUseDidNotAnswer = this.toggleUseDidNotAnswer.bind(this);
        this.toggleWeightedPassing = this.toggleWeightedPassing.bind(this);
        this.downloadCSV = this.downloadCSV.bind(this);
    }

    stateUpdateHandler(key, value) {
        // Reset to default tab if changing Eval or Category
        if(key === "eval" || key === "category") {
            this.setState({[key]: value, currentTab: "HyperCubeId"});
        } else {
            this.setState({[key]: value});
        }
    }

    toggleUseDidNotAnswer() {
        this.setState(prevState => ({useDidNotAnswer: !prevState.useDidNotAnswer}));
    }

    toggleWeightedPassing() {
        this.setState(prevState => ({weightedPassing: !prevState.weightedPassing}));
    }

    toggleTab(newTabName) {
        this.setState({currentTab: newTabName});
    }

    downloadCSV(tableData, tableHeaders, tableTitle) {
        const columnDelimiter = ',';
        const rowDelimter = '\n';
        let csvString = tableTitle + rowDelimter;

        for(let i=0; i < tableHeaders.length; i++) {
            if(i === tableHeaders.length -1) {
                csvString += tableHeaders[i].title + rowDelimter;
            } else {
                csvString += tableHeaders[i].title + columnDelimiter;
            }
        }

        for(let x=0; x < tableData.length; x++) {
            for(let y=0; y < tableHeaders.length; y++) {
                if(y === tableHeaders.length -1) {
                    csvString += tableData[x][tableHeaders[y].key] + rowDelimter;
                } else {
                    csvString += tableData[x][tableHeaders[y].key]  + columnDelimiter;
                }
            }
        }

        const downloader = document.createElement('a'); //create a link
        downloader.setAttribute('href', encodeURI("data:text/csv;charset=utf-8," + csvString)); //content to download
        downloader.setAttribute('download', `${tableTitle.replaceAll(' ', '-')}.csv`); //filename of download
        downloader.click(); //download
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
                            <Query query={getTestTypeOverviewData} variables={{
                                "eval": this.state.eval,
                                "categoryType": this.state.category}}>
                            {
                                ({ loading, error, data }) => {
                                    if (loading) return <div>Loading ...</div> 
                                    if (error) return <div>Overview data does not exist for these attributes.</div>

                                const testType = data[getTestTypeQueryName]["testType"];
                                const numberSlices = data[getTestTypeQueryName]["sliceNumber"];
                                const sliceKeywords = data[getTestTypeQueryName]["sliceKeywords"];

                                let numberSliceArray = [];
                                for(let i=0; i < numberSlices; i++) {
                                    numberSliceArray[i] = i + 1;
                                }

                                let sliceKeywordsObjArray = [];
                                for(let i=0; i < sliceKeywords.length; i++) {
                                    sliceKeywordsObjArray.push({
                                        label: sliceKeywords[i],
                                        value: sliceKeywords[i]
                                    })
                                }

                                return(
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
                                            <>
                                                <ul className="nav nav-tabs">
                                                    <li className="nav-item" >
                                                        <button className={"HyperCubeId" === this.state.currentTab ? 'nav-link overview-nav-link active' : 'nav-link overview-nav-link'} onClick={() => this.toggleTab("HyperCubeId")}>Hyper Cube ID</button>
                                                    </li>
                                                    <li className="nav-item" >
                                                        <button className={"AllIncorrect" === this.state.currentTab ? 'nav-link overview-nav-link active' : 'nav-link overview-nav-link'} onClick={() => this.toggleTab("AllIncorrect")}>All Incorrect Scenes</button>
                                                    </li>
                                                    {testType !== 'agents' &&
                                                        <li className="nav-item" >
                                                            <button className={"BySlice" === this.state.currentTab ? 'nav-link overview-nav-link active' : 'nav-link overview-nav-link'} onClick={() => this.toggleTab("BySlice")}>Results By Slice</button>
                                                        </li>
                                                    }
                                                    {/* Exclude Evaluation 3 Results because we didn't have scorecard functionality yet */}
                                                    {((testType === "interactive" || testType === "retrieval" || testType === "multi retrieval" || testType === "imitation") && this.state.eval !== "eval_3_results")  &&
                                                        <li className="nav-item" >
                                                            <button className={"Scorecard" === this.state.currentTab ? 'nav-link overview-nav-link active' : 'nav-link overview-nav-link'} onClick={() => this.toggleTab("Scorecard")}>Scorecard</button>
                                                        </li>
                                                    }
                                                </ul>
                                                <div className="overview-table-container">
                                                    {"HyperCubeId" === this.state.currentTab && 
                                                        <HyperCubeResultsTable state={this.state} downloadCSV={this.downloadCSV} hyperCubePivotValue="hyperCubeID"/>
                                                    }
                                                    {"BySlice" === this.state.currentTab && 
                                                        <HyperCubeResultsTable state={this.state} downloadCSV={this.downloadCSV} hyperCubePivotValue="slice" numberSliceArray={numberSliceArray} sliceKeywords={sliceKeywordsObjArray}/>
                                                    }
                                                    {"Scorecard" === this.state.currentTab && 
                                                        <ScoreCardTable state={this.state} downloadCSV={this.downloadCSV}/>
                                                    }
                                                    {"AllIncorrect" === this.state.currentTab &&
                                                        <AllIncorrectScenes state={this.state}/>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </>
                                )}
                            }</Query>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default TestOverview;