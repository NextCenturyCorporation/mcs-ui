import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const hyperCubeDataQueryName = "getTestOverviewData";
const getHyperCubeData = gql`

query getTestOverviewData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!, $useDidNotAnswer: Boolean!, $weightedPassing: Boolean!, $statType: String!, $sliceLevel: Int!) {
    getTestOverviewData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata, useDidNotAnswer: $useDidNotAnswer, weightedPassing: $weightedPassing, statType: $statType, sliceLevel: $sliceLevel) 

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

class HyperCubeResultsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sliceLevel: 1
        }
    }

    updateSliceLevel(newSliceLevel) {
        this.setState({sliceLevel: newSliceLevel});
    }

    render() {
        return (
            <Query query={getHyperCubeData} variables={{
                "eval": this.props.state.eval,
                "categoryType": this.props.state.category,
                "performer": this.props.state.performer,
                "metadata": this.props.state.metadata,
                "useDidNotAnswer": this.props.state.useDidNotAnswer,
                "weightedPassing": this.props.state.weightedPassing,
                "statType": this.props.hyperCubePivotValue,
                "sliceLevel": this.state.sliceLevel}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Overview data does not exist for these attributes.</div>

                    const hyperCubeData = data[hyperCubeDataQueryName]["stats"];

                    const tableTitle = "Overview Stats (" + this.props.state.category + "/" + 
                        this.props.state.performer + "/" + this.props.state.metadata + ")";

                    let overViewTableFields = [{"title": this.props.hyperCubePivotValue, "key": this.props.hyperCubePivotValue}];
                    overViewTableFields = overViewTableFields.concat(overViewTableFieldsStatic);

                    const notActiveButtonClasses = "btn btn-outline-secondary";
                    const activeButtonClasses = "btn btn-outline-secondary active";

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
                                    <span className="slice-header">Slice level: </span>
                                    <div className="btn-group me-2" role="group">
                                        <button type="button" className={this.state.sliceLevel === 1 ? activeButtonClasses : notActiveButtonClasses} onClick={()=>this.updateSliceLevel(1)}>1</button>
                                        <button type="button" className={this.state.sliceLevel === 2 ? activeButtonClasses : notActiveButtonClasses} onClick={()=>this.updateSliceLevel(2)}>2</button>
                                        <button type="button" className={this.state.sliceLevel === 3 ? activeButtonClasses : notActiveButtonClasses} onClick={()=>this.updateSliceLevel(3)}>3</button>
                                        <button type="button" className={this.state.sliceLevel === 4 ? activeButtonClasses : notActiveButtonClasses} onClick={()=>this.updateSliceLevel(4)}>4</button>
                                    </div>
                                </div>
                            }
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
                        </>
                    )
                }
            }
            </Query>
        );
    }
}

export default HyperCubeResultsTable;