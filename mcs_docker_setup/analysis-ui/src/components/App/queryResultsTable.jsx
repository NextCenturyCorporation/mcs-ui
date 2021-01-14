import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import Select from 'react-select';
import {Link} from 'react-router-dom';

function getSorting(order, orderBy) {
    return order === "desc"
    ? (a, b) => (_.get(a, orderBy) > _.get(b, orderBy) ? -1 : 1)
    : (a, b) => (_.get(a, orderBy) < _.get(b, orderBy) ? -1 : 1);
}

const ToolTipWithStyles = withStyles({
    tooltip: {
        fontSize: '12px',
        padding: '10px'
    }
})(Tooltip);

const QueryResultsPaginationStyles = makeStyles((theme) => ({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }));

function TablePaginationActions(props) {
    const classes = QueryResultsPaginationStyles();
    const theme = useTheme();
    const { count, page, rowsPerPage, onChangePage } = props;
  
    const handleFirstPageButtonClick = (event) => {
        onChangePage(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
        onChangePage(event, page - 1);
    };
    
    const handleNextButtonClick = (event) => {
        onChangePage(event, page + 1);
    };
    
    const handleLastPageButtonClick = (event) => {
        onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
        <div className={classes.root}>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </div>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired
};

class QueryResultsTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groupBy: "",
            sortBy: "",
            sortOrder: "asc",
            expandedGroups: [],
            page: 0,
            rowsPerPage: 10
        };

        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.setQueryGroupBy = this.setQueryGroupBy.bind(this);
    }
    
    getColumnData = columns => {
        return columns.filter(item => true);
    };
  
    getGroupedData = rows => {
        const { sortBy, sortOrder } = this.state;
        const expandedGroups = {};

        if(this.state.groupBy === "") {
            return rows.sort(getSorting(sortOrder, sortBy));
        }

        const groupedData = rows.reduce((acc, item) => {
            let key =_.get(item, this.state.groupBy)
            let groupData = acc[key] || [];
            acc[key] = groupData.concat([item]);
            return acc;
        }, {});

        Object.keys(groupedData).forEach(item => {
            expandedGroups[item] = this.state.expandedGroups.indexOf(item) !== -1;
            groupedData[item] = groupedData[item].sort(getSorting(sortOrder, sortBy));
        });

        this.groups = expandedGroups;
        return groupedData;
    };
    
    handleRequestSort = property => {
        let sortOrderCheck = "desc";
    
        if (this.state.sortBy === property && this.state.sortOrder === "desc") {
            sortOrderCheck = "asc";
        }
    
        this.setState({ 
            sortOrder: sortOrderCheck, 
            sortBy: property 
        });
    };
    
    expandRow = groupVal => {
        const curr = this.groups[groupVal];
        let expandedGroups = this.state.expandedGroups;
    
        if (curr) {
            expandedGroups = expandedGroups.filter(item => item !== groupVal);
        } else {
            if (expandedGroups.indexOf(groupVal) === -1) {
                expandedGroups = expandedGroups.concat([groupVal]);
            }
        }
        
        this.setState({ expandedGroups: expandedGroups });
    };

    getToolTipTextForTable = (rowItem, key) => {
        return "" + _.get(rowItem, key);
    }

    handleChangePage = (event, newPage) => {
        this.setState({page: newPage});
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
        });
    };

    setQueryGroupBy = (event) => {
        this.setState({groupBy: event.value});
    }
    
    getAnalysisPageURL = (item) => {
        if(item.scene.test_type && item.scene.scene_num) {
            return "/analysis?eval=eval2_history&test_type=" + item.scene.test_type + "&scene_num=" + item.scene.scene_num;
        } else {
            // Eval 3 - use category_type & scene_part_num instead of scene_num
            return "/analysis?eval=Evaluation%203%20Results&category_type=" + item.category_type + "&scene_num=" + item.scene_part_num;
        }
    }

    render() {
        let { rows, columns } = this.props;
        let columnData = this.getColumnData(columns);
        let groupedData = this.getGroupedData(rows);
        let { sortBy, sortOrder } = this.state;
        const emptyRows = this.state.rowsPerPage - 
            Math.min(this.state.rowsPerPage, groupedData.length - this.state.page * this.state.rowsPerPage);
    
        return (
            <div className="query-results-table-holder">
                <div className="results-group-chooser">
                    <div className="query-builder-label">Group Table By</div>
                    <Select className="results-groupby-selector"
                        onChange={this.setQueryGroupBy} 
                        options={this.props.groupByOptions}/>
                </div>
                <div className="results-table-scroll">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell key='result_table_cell_link' className="results-table-header-cell">
                                    Analysis Page Link
                                </TableCell>

                                {columnData.map((item, key) => (
                                    <TableCell key={'result_table_cell_' + key} className="results-table-header-cell">
                                        <TableSortLabel active={sortBy === item.dataKey} direction={sortOrder} 
                                            onClick={this.handleRequestSort.bind(null, item.dataKey)}>{item.title}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.groupBy === "" && 
                                <React.Fragment>
                                    {(this.state.rowsPerPage > 0 ? 
                                        groupedData.slice(this.state.page * this.state.rowsPerPage, 
                                            this.state.page * this.state.rowsPerPage + this.state.rowsPerPage) : groupedData).map((rowItem, rowKey) => (
                                        <TableRow key={'table_row_' + rowKey}>
                                            <TableCell key={'table_cell_' + rowKey + "_link"}>
                                                <ToolTipWithStyles arrow={true} title='View Details' placement='right'>
                                                    <div className="table-cell-wrap-text">
                                                        <Link to={this.getAnalysisPageURL(rowItem)} target="_blank">View Details</Link>
                                                    </div>
                                                </ToolTipWithStyles>
                                            </TableCell>

                                            {columnData.map((columnItem, columnKey) => (
                                                <TableCell key={'table_cell_' + rowKey + "_" + columnKey}>
                                                    <ToolTipWithStyles arrow={true} title={this.getToolTipTextForTable(rowItem, columnItem.dataKey)} placement='right'>
                                                        <div className="table-cell-wrap-text">
                                                            {_.get(rowItem, columnItem.dataKey)}
                                                        </div>
                                                    </ToolTipWithStyles>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * emptyRows }}>
                                            <TableCell colSpan={columnData.length}/>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            }
                            {this.state.groupBy !== "" && 
                                <>
                                    {Object.keys(groupedData).map(key => {return (
                                        <React.Fragment key={"react_frag_row_" + key}>
                                            <TableRow key={"grouped_table_row_" + key}>
                                                <TableCell colSpan={columnData.length} onClick={this.expandRow.bind(null, key)}>
                                                    <IconButton>
                                                        <Icon>
                                                            {this.groups[key] ? "expand_more" : "chevron_right"}
                                                        </Icon>
                                                    </IconButton>
                                                    <span>{key + " (" + groupedData[key].length +  " - " + ((groupedData[key].length/rows.length*100).toFixed(1)) + "%)"}</span>
                                                </TableCell>
                                            </TableRow>

                                            {this.groups[key] && groupedData[key].map((rowItem, rowKey) => (
                                                <TableRow key={'table_row_grouped_' + rowKey}>
                                                    <TableCell key={'table_cell_grouped_' + rowKey + "_link"}>
                                                    <ToolTipWithStyles arrow={true} title='View Details' placement='right'>
                                                        <div className="table-cell-wrap-text">
                                                            <Link to={this.getAnalysisPageURL(rowItem)} target="_blank">View Details</Link>
                                                        </div>
                                                    </ToolTipWithStyles>
                                                </TableCell>

                                                    {columnData.map((columnItem, columnKey) => (
                                                        <TableCell key={'table_cell_' + rowKey + "_" + columnKey}>
                                                            <ToolTipWithStyles arrow={true} title={this.getToolTipTextForTable(rowItem, columnItem.dataKey)} placement='right'>
                                                                <div className="table-cell-wrap-text">
                                                                    {_.get(rowItem, columnItem.dataKey)}
                                                                </div>
                                                            </ToolTipWithStyles>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    );})} 
                                </>
                            }
                        </TableBody>
                        {this.state.groupBy === "" && 
                            <TableFooter className="query-results-footer">
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                        colSpan={3}
                                        count={groupedData.length}
                                        rowsPerPage={this.state.rowsPerPage}
                                        page={this.state.page}
                                        SelectProps={{
                                            inputProps: { 'aria-label': 'rows per page' },
                                            native: true,
                                        }}
                                        onChangePage={this.handleChangePage}
                                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                        ActionsComponent={TablePaginationActions}
                                    />
                                </TableRow>
                            </TableFooter>
                        }
                    </Table>
                </div>
            </div>
        );
    }
}

export default QueryResultsTable;
