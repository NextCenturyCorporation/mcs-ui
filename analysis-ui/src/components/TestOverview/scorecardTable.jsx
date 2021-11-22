import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const scorecardDataQueryName = "getScoreCardData";
const getScorecardDataQuery = gql`
    query getScoreCardData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!) {
        getScoreCardData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata) 
    }`;

const scorecardFields = [
    {"title": "HyperCubeId", "key": "hypercubeID"},
    {"title": "Repeat Failed", "key": "totalRepeatFailed"},
    {"title": "Attempt Impossible", "key": "totalAttemptImpossible"},
    {"title": "Open Unopenable", "key": "totalOpenUnopenable"},
    {"title": "Multiple Container Look", "key": "totalMultipleContainerLook"},
    {"title": "Not Moving Toward Object", "key": "totalNotMovingTowardObject"},
    {"title": "Revisits", "key": "totalRevisits"}
];
class ScoreCardTable extends React.Component {

    getTotalScoreCardValue(scorecardData, key) {
        let currentTotal = 0;
        for(let i=0; i < scorecardData.length; i++) {
            currentTotal += scorecardData[i][key];
        }

        return currentTotal;
    }

    prepareDataForCSV(scorecardData, titleString){
        for(let i=0; i < scorecardData.length; i++) {
            scorecardData[i].hypercubeID = scorecardData[i]._id.hypercubeID;
        }

        let totals = {};
        for(let j=0; j < scorecardFields.length; j++) {
            if(scorecardFields[j].key === "hypercubeID") {
                totals[scorecardFields[j].key] = "Totals";
            } else {
                totals[scorecardFields[j].key] = this.getTotalScoreCardValue(scorecardData, scorecardFields[j].key);
            }
        }

        scorecardData.push(totals);
        this.props.downloadCSV(scorecardData, scorecardFields, titleString)
    }

    render() {
        return (
            <Query query={getScorecardDataQuery} variables={{
                "eval": this.props.state.eval,
                "categoryType": this.props.state.category,
                "performer": this.props.state.performer,
                "metadata": this.props.state.metadata}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const scorecardData = data[scorecardDataQueryName];
                    const tableTitle = "Scorecard (" + this.props.state.category + "/" + 
                        this.props.state.performer + "/" + this.props.state.metadata + ")";

                    return (
                        <>
                        {scorecardData.length > 0 &&
                            <div className="scorecard-holder">
                                <h4>{tableTitle}</h4>
                                <div className="overview-results-csv-holder">
                                    <div className="csv-results-child">
                                        <IconButton onClick={() => {this.prepareDataForCSV(scorecardData, tableTitle)}}>
                                            <span className="material-icons">
                                                get_app
                                            </span>CSV
                                        </IconButton>
                                    </div>
                                </div>
                                <Table className="score-table" aria-label="simple table" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {scorecardFields.map((field, key) =>
                                                <TableCell key={'scorecard_header_cell' + key}>{field.title}</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {scorecardData.map((scoreCardCell, hyperKey) =>
                                            <TableRow key={'scorecard_row_' + hyperKey} classes={{ root: 'TableRow'}}>
                                                {scorecardFields.map((field, fieldKey) => 
                                                    <TableCell key={'scorecard_row_cell_' + hyperKey + fieldKey}>
                                                        {field["key"] === "hypercubeID" ? scoreCardCell["_id"][field["key"]] : scoreCardCell[field["key"]]}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                        <TableRow classes={{ root: 'TableRow'}}>
                                            {scorecardFields.map((field, key) =>
                                                <TableCell key={'scorecard_total_cell' + key}>
                                                    {field["key"] === "hypercubeID" ? "Totals" : this.getTotalScoreCardValue(scorecardData, field["key"])}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        }
                        </>
                    )
                }
            }
            </Query>    
        );
    }
}

export default ScoreCardTable;