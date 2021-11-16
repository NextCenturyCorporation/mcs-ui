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

class HyperCubeResultsTable extends React.Component {

    constructor(props) {
        super(props);
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

                    return (
                        <>
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
                                        <TableCell>Standard Error</TableCell>
                                        <TableCell>SEM</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {hyperCubeData.map((hyperCell, hyperKey) =>
                                        <TableRow key={'hyper_row_' + hyperKey} classes={{ root: 'TableRow'}}>
                                            <TableCell>{hyperCell.hyperCubeID}</TableCell>
                                            <TableCell>{hyperCell.correct_plausible}</TableCell>
                                            <TableCell>{hyperCell.incorrect_plausible}</TableCell>
                                            <TableCell>{hyperCell.hitRate}</TableCell>
                                            <TableCell>{hyperCell.correct_implausible}</TableCell>
                                            <TableCell>{hyperCell.incorrect_implausible}</TableCell>
                                            <TableCell>{hyperCell.falseAlarm}</TableCell>
                                            <TableCell>{hyperCell.total}</TableCell>
                                            <TableCell>{hyperCell.mean}</TableCell>
                                            <TableCell>{hyperCell.dPrime}</TableCell>
                                            <TableCell>{hyperCell.standardError}</TableCell>
                                            <TableCell>{hyperCell.sem}</TableCell>
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