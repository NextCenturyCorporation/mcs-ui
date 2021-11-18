import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
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

class ScoreCardTable extends React.Component {

    constructor(props) {
        super(props);
    }

    getTotalScoreCardValue(scorecardData, key) {
        let currentTotal = 0;
        for(let i=0; i < scorecardData.length; i++) {
            currentTotal += scorecardData[i][key];
        }

        return currentTotal;
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

                    return (
                        <>
                        {scorecardData.length > 0 &&
                            <div className="scorecard-holder">
                                <h4>Scorecard</h4>
                                <Table className="score-table" aria-label="simple table" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>HyperCubeId</TableCell>
                                            <TableCell>Repeat Failed</TableCell>
                                            <TableCell>Attempt Impossible</TableCell>
                                            <TableCell>Open Unopenable</TableCell>
                                            <TableCell>Multiple Container Look</TableCell>
                                            <TableCell>Not Moving Toward Object</TableCell>
                                            <TableCell>Revisits</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {scorecardData.map((scoreCardCell, hyperKey) =>
                                            <TableRow key={'scorecard_row_' + hyperKey} classes={{ root: 'TableRow'}}>
                                                <TableCell>{scoreCardCell._id.hypercubeID}</TableCell>
                                                <TableCell>{scoreCardCell.totalRepeatFailed}</TableCell>
                                                <TableCell>{scoreCardCell.totalAttemptImpossible}</TableCell>
                                                <TableCell>{scoreCardCell.totalOpenUnopenable}</TableCell>
                                                <TableCell>{scoreCardCell.totalMultipleContainerLook}</TableCell>
                                                <TableCell>{scoreCardCell.totalNotMovingTowardObject}</TableCell>
                                                <TableCell>{scoreCardCell.totalRevisits}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow classes={{ root: 'TableRow'}}>
                                            <TableCell>Totals</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalRepeatFailed")}</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalAttemptImpossible")}</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalOpenUnopenable")}</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalMultipleContainerLook")}</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalNotMovingTowardObject")}</TableCell>
                                            <TableCell>{this.getTotalScoreCardValue(scorecardData, "totalRevisits")}</TableCell>
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