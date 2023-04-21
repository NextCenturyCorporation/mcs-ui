import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import SlicesChart from './sliceBarChart';

const hyperCubeDataQueryName = "getTestOverviewData";
const getHyperCubeData = gql`

query getTestOverviewData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!, $useDidNotAnswer: Boolean!, $weightedPassing: Boolean!, $statType: String!, $sliceLevel: Int!, $sliceType: String!, $sliceKeywords: JSON!) {
    getTestOverviewData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata, useDidNotAnswer: $useDidNotAnswer, weightedPassing: $weightedPassing, statType: $statType, sliceLevel: $sliceLevel, sliceType: $sliceType, sliceKeywords: $sliceKeywords) 
}`;

const overViewTableFieldsStatic = [
    {"title": "Correct Plausible", "key": "correct_plausible"},
    {"title": "Incorrect Plausible", "key": "incorrect_plausible"},
    {"title": "No Answer Plausible", "key": "did_not_answer_plausible"},
    {"title": "Hit Rate", "key": "hitRate"},
    {"title": "Correct Implausible", "key": "correct_implausible"},
    {"title": "Incorrect Implausible", "key": "incorrect_implausible"},
    {"title": "No Answer Implausible", "key": "did_not_answer_implausible"},
    {"title": "False Alarm", "key": "falseAlarm"},
    {"title": "Total", "key": "total"},
    {"title": "Mean", "key": "mean"},
    {"title": "dPrime", "key": "dPrime"},
    {"title": "Standard Deviation", "key": "standardDeviation"},
    {"title": "SEM", "key": "standardError"}
];

const KeywordSelectOption = (props) => {
    return (
        <div>
            <components.Option {...props}>
                <input type="checkbox" checked={props.isSelected} onChange={() => null}/>{" "}
                <label className="keyword-label">{props.label}</label>
            </components.Option>
        </div>
    );
};

const KeywordEmptyContainer = ({ children, ...props }) => {
    const { getValue, hasValue } = props;
    const numberSelected = getValue().length;
    if (!hasValue) {
        return (
            <components.ValueContainer {...props}>
                {children}
            </components.ValueContainer>
        );
    }

    let newChildren = [`${numberSelected} items selected`];
    newChildren.push(children[1]);
    return (
        <components.ValueContainer {...props}>
            {newChildren}
        </components.ValueContainer>
    );
};

let hyperCubeData;
let chartData;

class HyperCubeResultsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sliceLevel: 1,
            sliceType: "level",
            sliceKeywords: []
        }

        this.setKeywords = this.setKeywords.bind(this);
    }

    updateSliceLevel(newSliceLevel) {
        this.setState({sliceLevel: newSliceLevel});
    }

    updateSliceViwer(newViewType) {
        this.setState({"sliceType": newViewType});
    }

    setKeywords(keywords) {
        this.setState({"sliceKeywords": keywords});
    }

    setChartData(data) {
        let barColors = [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
        "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"].reverse()
        let defaultColor = "#1f77b4"
        let newData = []
        let ignoreSlices = ["Totals", "Totals Plausible", "Totals Implausible"]
        data.forEach(item =>{
 
            if('slice' in item && (!ignoreSlices.includes(item['slice'])) &&
                "mean" in item && item["mean"] !== "NaN") {
                let newItem = {}

                newItem["slice"] = item["slice"]
                newItem["value"] = parseFloat(item["mean"])
                if(item["standardError"] !== "NaN") {
                    newItem["errorY"] = [
                        parseFloat(item["standardError"]), 
                        parseFloat(item["standardError"])
                    ]
                } else {
                    newItem["errorY"] = [0, 0]
                }

                let newColor = barColors.pop()
                // if for whatever reason we're out of colors, use the blue color
                // from original colors array
                if(newColor == undefined) {
                    newColor = defaultColor
                }
                newItem["color"] = newColor
                newData.push(newItem)

            }
        })
        return newData;
    }

    render() {
        const tableTitle = "Overview Stats (" + this.props.state.category + "/" + 
                this.props.state.performer + "/" + this.props.state.metadata + ")";
        const notActiveButtonClasses = "btn btn-outline-secondary";
        const activeButtonClasses = "btn btn-outline-secondary active";
        let overViewTableFields = [{"title": this.props.hyperCubePivotValue, "key": this.props.hyperCubePivotValue}];
        overViewTableFields = overViewTableFields.concat(overViewTableFieldsStatic);

        return (
            <>
                <h4>{tableTitle}</h4>
                <div className="overview-results-csv-holder">
                    <div className="csv-results-child">
                        <IconButton onClick={() => {this.props.downloadCSV(hyperCubeData, overViewTableFields, tableTitle)}}>
                            <span className="material-icons">
                                get_app
                            </span>CSV
                        </IconButton>
                    </div>
                </div>
                {this.props.hyperCubePivotValue === "slice" &&
                    <div className="overview-results-slice-chooser">
                        <div className="metadata-group btn-group" role="group">
                            <button className={this.state.sliceType === "level" ? 'btn btn-primary active' : 'btn btn-secondary'} type="button"
                                    onClick={() => this.updateSliceViwer("level")}>Level</button>
                            <button className={this.state.sliceType === "keyword" ? 'btn btn-primary active' : 'btn btn-secondary'} type="button"
                                    onClick={() => this.updateSliceViwer("keyword")}>Keyword</button>
                        </div>
                        {this.state.sliceType === "level" &&
                            <>
                                <span className="slice-header">Slice level: </span>
                                <div className="btn-group me-2" role="group">
                                    {this.props.numberSliceArray.map((sliceNum, key) =>
                                        <button key={'slice_level_' + key} type="button" className={this.state.sliceLevel === sliceNum ? activeButtonClasses : notActiveButtonClasses} onClick={()=>this.updateSliceLevel(sliceNum)}>{sliceNum}</button>
                                    )}
                                </div>
                            </>
                        }
                        {this.state.sliceType === "keyword" &&
                            <div className="slice-keywords-chooser">
                                <ReactSelect
                                    onChange={this.setKeywords}
                                    options={this.props.sliceKeywords}
                                    value={this.state.sliceKeywords}
                                    isMulti
                                    hideSelectedOptions={false}
                                    closeMenuOnSelect={false}
                                    components={{
                                        Option: KeywordSelectOption,
                                        ValueContainer: KeywordEmptyContainer
                                    }}
                                />
                            </div>
                        }
                    </div>
                }
                <Query query={getHyperCubeData} variables={{
                    "eval": this.props.state.eval,
                    "categoryType": this.props.state.category,
                    "performer": this.props.state.performer,
                    "metadata": this.props.state.metadata,
                    "useDidNotAnswer": this.props.state.useDidNotAnswer,
                    "weightedPassing": this.props.state.weightedPassing,
                    "statType": this.props.hyperCubePivotValue,
                    "sliceLevel": this.state.sliceLevel,
                    "sliceType": this.state.sliceType,
                    "sliceKeywords": this.state.sliceKeywords }}>
                {
                    ({ loading, error, data }) => {
                        if (loading) return <div>Loading ...</div> 
                        if (error) return <div>Overview data does not exist for these attributes.</div>

                        hyperCubeData = data[hyperCubeDataQueryName]["stats"];
                        chartData = this.setChartData(hyperCubeData)
                        return (
                            <>

                                <Table className="score-table" aria-label="simple table" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {overViewTableFields.map((field, key) =>
                                                <TableCell key={'overfiew_header_cell' + key}>{field.title}</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {hyperCubeData.map((hyperCell, hyperKey) =>
                                            <TableRow key={'hyper_row_' + hyperKey} classes={{ root: 'TableRow'}}>
                                                {overViewTableFields.map((field, fieldKey) => 
                                                    <TableCell key={'hyper_row_cell_' + hyperKey + fieldKey}>
                                                        {hyperCell[field["key"]]}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {this.props.hyperCubePivotValue !== "hyperCubeID" && 
                                <div className="flex-chart-left">
                                    <SlicesChart data={chartData} performer={this.props.state.performer}/>
                                </div>
                                }
                                
                            </>
                        )
                    }
                }
                </Query>
            </>
        );
    }
}

export default HyperCubeResultsTable;