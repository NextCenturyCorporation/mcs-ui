import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ScoreCardTable from './scorecardTable';

const hyperCubeDataQueryName = "getTestOverviewData";
const getHyperCubeData = gql`
    query getTestOverviewData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!, $useDidNotAnswer: Boolean!) {
        getTestOverviewData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata, useDidNotAnswer: $useDidNotAnswer) 
    }`;

const overViewTableFields = [
    {"title": "HyperCubeId", "key": "hyperCubeID"},
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

        this.downloadCSV = this.downloadCSV.bind(this);
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
            <Query query={getHyperCubeData} variables={{
                "eval": this.props.state.eval,
                "categoryType": this.props.state.category,
                "performer": this.props.state.performer,
                "metadata": this.props.state.metadata,
                "useDidNotAnswer": this.props.state.useDidNotAnswer}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const hyperCubeData = data[hyperCubeDataQueryName]["stats"];
                    const testType = data[hyperCubeDataQueryName]["testType"];

                    const tableTitle = "Overview Stats (" + this.props.state.category + "/" + 
                        this.props.state.performer + "/" + this.props.state.metadata + ")";


                    return (
                        <>
                            <h4>{tableTitle}</h4>
                            <div className="overview-results-csv-holder">
                                <div className="csv-results-child">
                                    <IconButton onClick={() => {this.downloadCSV(hyperCubeData, overViewTableFields, tableTitle)}}>
                                        <span className="material-icons">
                                            get_app
                                        </span>CSV
                                    </IconButton>
                                </div>
                            </div>
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

                            {/* Exclude Evaluation 3 Results because we didn't have scorecard functionality yet */}
                            {((testType === "interactive" || testType === 'retrieval') && this.props.state.eval !== "Evaluation 3 Results")  &&
                                <ScoreCardTable state={this.props.state} downloadCSV={this.downloadCSV}/>
                            }
                        </>
                    )
                }
            }
            </Query>
        );
    }
}

export default HyperCubeResultsTable;