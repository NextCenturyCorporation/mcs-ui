import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const hyperCubeDataQueryName = "getTestOverviewData";
const getHyperCubeData = gql`
    query getTestOverviewData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!) {
        getTestOverviewData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata) 
    }`;

const scorecardDataQueryName = "getScoreCardData";
const getScorecardDataQuery = gql`
    query getScoreCardData($eval: String!, $categoryType: String!, $performer: String!, $metadata: String!) {
        getScoreCardData(eval: $eval, categoryType: $categoryType, performer: $performer, metadata: $metadata) 
    }`;

class HyperCubeResultsTable extends React.Component {

    constructor(props) {
        super(props);
    }

    checkValueToRender(checkValue, partnerValue) {
        if(isNaN(partnerValue) || partnerValue === 0) {
            if(isNaN(checkValue) || checkValue === 0) {
                return "-";
            } 
        }

       return checkValue;
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
            <Query query={getHyperCubeData} variables={{
                "eval": this.props.state.eval,
                "categoryType": this.props.state.category,
                "performer": this.props.state.performer,
                "metadata": this.props.state.metadata}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    const hyperCubeData = data[hyperCubeDataQueryName]["stats"];
                    const testType = data[hyperCubeDataQueryName]["testType"];

                    return (
                        <>
                            <h4>Overview Stats</h4>
                            <Table className="score-table" aria-label="simple table" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>HyperCubeId</TableCell>
                                        <TableCell>Correct Plausible</TableCell>
                                        <TableCell>Incorrect Plausible</TableCell>
                                        <TableCell>Hit Rate</TableCell>
                                        <TableCell>Correct Implausible</TableCell>
                                        <TableCell>Incorrect Implausible</TableCell>
                                        <TableCell>False Alarm</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Mean</TableCell>
                                        <TableCell>dPrime</TableCell>
                                        <TableCell>Standard Deviation</TableCell>
                                        <TableCell>SEM</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {hyperCubeData.map((hyperCell, hyperKey) =>
                                        <TableRow key={'hyper_row_' + hyperKey} classes={{ root: 'TableRow'}}>
                                            <TableCell>{hyperCell.hyperCubeID}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.correct_plausible, hyperCell.incorrect_plausible)}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.incorrect_plausible, hyperCell.correct_plausible)}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.hitRate, NaN)}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.correct_implausible, hyperCell.incorrect_implausible)}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.incorrect_implausible, hyperCell.correct_implausible)}</TableCell>
                                            <TableCell>{this.checkValueToRender(hyperCell.falseAlarm, NaN)}</TableCell>
                                            <TableCell>{hyperCell.total}</TableCell>
                                            <TableCell>{hyperCell.mean}</TableCell>
                                            <TableCell>{hyperCell.dPrime}</TableCell>
                                            <TableCell>{hyperCell.standardDeviation}</TableCell>
                                            <TableCell>{hyperCell.standardError}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {(testType === "interactive" || testType === 'retrieval') &&
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
                                        console.log(scorecardData);
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