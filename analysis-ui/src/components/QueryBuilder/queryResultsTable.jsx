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
import {PerformanceStatistics, getStats} from './performanceStatistics';

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
            expandedGroups: []
        };

        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
        this.setQueryGroupBy = this.setQueryGroupBy.bind(this);
    }
    
    getColumnData = columns => {
        return columns.filter(item => true);
    };
  
    getGroupedData = rows => {
        const expandedGroups = {};

        if(this.props.groupBy.value === "") {
            return rows;
        }

        let groupedData = {};
        for(let i=0; i < rows.length; i++) {
            let groupArray = [];
            if(this.state.expandedGroups[rows[i]._id.groupField] !== undefined) {
                groupArray = this.state.expandedGroups[rows[i]._id.groupField];
            }
            groupedData[rows[i]._id.groupField] = groupArray;
        }

        Object.keys(groupedData).forEach(item => {
            expandedGroups[item] = this.state.expandedGroups[item];
        });

        this.groups = expandedGroups;
        return groupedData;
    };

    getGroupedCSVData = rows => {
        const sortBy = this.props.sortBy.property;
        const sortOrder = this.props.sortBy.sortOrder;
        const expandedGroups = {};

        if(this.props.groupBy.value === "") {
            return rows.sort(getSorting(sortOrder, sortBy));
        }

        const groupedData = rows.reduce((acc, item) => {
            let key =_.get(item, this.props.groupBy.value);
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
    
    handleRequestSort = sortBy => {
        let sortOrderCheck = "desc";
        if(typeof(sortBy) === "string") {
            if (this.props.sortBy.property === sortBy && this.props.sortBy.sortOrder === "desc") {
                sortOrderCheck = "asc";
            }
            this.props.setTableSortBy({property: sortBy, sortOrder: sortOrderCheck});
        }
        else {
            this.props.setTableSortBy({property: sortBy.property, sortOrder: sortBy.sortOrderCheck});
        }
    };
    
    expandRow = groupVal => {
        const curr = this.groups[groupVal];
        let expandedGroups = this.state.expandedGroups;

        if(curr) {
            expandedGroups[groupVal] = undefined;
            this.setState({ expandedGroups: expandedGroups });
            return;
        }

        const metadataRow = this.getGroupMetadata(groupVal);
        this.props.getGroupingRows(metadataRow.total, groupVal, this.props.groupBy.value).then((data) => {
            expandedGroups[groupVal] = data;
            this.setState({ expandedGroups: expandedGroups });
        });
    };

    getToolTipTextForTable = (rowItem, key) => {
        return "" + _.get(rowItem, key);
    }

    handleChangePage = (event, newPage) => {
        this.props.pageUpdateHandler(newPage);
    }

    handleChangeRowsPerPage = (event) => {
        this.props.rowsUpdatehandler(event.target.value);
    };

    setQueryGroupBy = (event) => {
        this.props.setGroupBy(event);
    }

    updateTableGroupAndSortBy = (groupBy, sortBy) => {
        if(this.props.currentTab === this.props.tabId) {
            if(groupBy === undefined || groupBy === null || groupBy === "")
                groupBy = {value:"", label:"None"}
            if(sortBy === undefined || sortBy === null || sortBy === "")
                sortBy = {property:"", sortOrder:"acs"}
            this.setQueryGroupBy(groupBy);
            this.handleRequestSort(sortBy);
        }
    }

    getAnalysisPageURL = (item) => {
        if(item.eval === "Evaluation 2 Results") {
            let catTypePair = item.category === "interactive" ? item.category_pair + "_" + item.category_type : item.category_type;
            return "/analysis?eval=" + this.props.historyCollection + "&cat_type_pair=" + catTypePair +
                "&test_num=" + item.test_num + "&scene=" + item.scene_num;
        } else {
            // Eval 3+ - use category_type in the URL
            return "/analysis?eval=" + this.props.historyCollection + "&category_type=" + item.category_type + 
                "&test_num=" + item.test_num + "&scene=" + item.scene_num;
        }
    }

    getGroupMetadata = (key) => {
        for(let i=0; i < this.props.rows.length; i++) {
            if(key == this.props.rows[i]._id.groupField) {
                return this.props.rows[i];
            }
        }
        return {};
    }

    downloadCSV = () => {
        this.props.getCSVDownloadData(this.props.totalResultCount).then((data) => {
            console.log("getCSVDownloadData", data);
            let {columns} = this.props;
            let columnData = this.getColumnData(columns);
            let groupedData = this.getGroupedCSVData(data.results);

            let columnDelimiter = ',';
            let rowDelimter = '\n';
            let csvString = ''; //append all content to this really long string

            let keysToCSV = []
            let titles = [];

            if(this.props.groupBy.value !== "") {
                titles.push("Group Table By");
                titles.push("Group");
            }

            columnData.forEach(item => {
                keysToCSV.push(item.dataKey);
                titles.push(item.title);
            });
        
            if(this.props.groupBy.value === "") {
                let stats = getStats(data.metadata[0]);
                csvString += `Total Results: ${groupedData.length}` + columnDelimiter + stats.correct.substring(1).replaceAll(',', '') + 
                    columnDelimiter + stats.incorrect.substring(1).replaceAll(',', '') + rowDelimter
            }

            csvString += titles.join(columnDelimiter).toUpperCase() + rowDelimter;
            const appendDataStringToCSV = (data) => {
                keysToCSV.forEach(element => {
                    let value = _.get(data, element);
                    if(value !== undefined && value !== null && value.constructor === Array)
                        value = value[0];
                    if(String(value).includes("OPICS (OSU, UU, NYU)")) //csv files automatically use commas as column seperators
                        value = "OPICS (OSU-UU-NYU)";
                    csvString += value !== undefined && value !== null ? String(value) + columnDelimiter: columnDelimiter;
                });
                csvString = csvString.slice(0, -1) + rowDelimter; //replace last column delimiter with row delimiter
            }

            let groupByTitle = "";
            if(this.props.groupBy.value === "") {
                groupedData.forEach(data => {
                    appendDataStringToCSV(data);
                });
            } else {
                columnData.forEach(item => {
                    if(item.dataKey === this.props.groupBy.value)
                        groupByTitle = item.title
                });
                const groupedByObjectsAsArray = Object.entries(groupedData);
                groupedByObjectsAsArray.forEach(groupedByObject => {
                    let stats = getStats(this.getGroupMetadata(groupedByObject[0]));
                    csvString += `Total Results: ${groupedByObject[1].length}` + columnDelimiter + stats.correct.substring(1).replaceAll(',', '') + 
                        columnDelimiter + stats.incorrect.substring(1).replaceAll(',', '') + rowDelimter
                    groupedByObject[1].forEach(data => {
                        csvString += groupByTitle + columnDelimiter;
                        csvString += String(groupedByObject[0]) !== 'undefined' && String(groupedByObject[0]) !== 'null' ? String(groupedByObject[0]) + columnDelimiter : columnDelimiter;
                        appendDataStringToCSV(data);
                    })
                })
            }

            let csvContent = "data:text/csv;charset=utf-8," + csvString; //encode csv format
            let filename = `${_.kebabCase(this.props.name)}${this.props.groupBy.value !== "" ? "_grouped-by-" +_.kebabCase(groupByTitle) : ""}` + 
                        `${this.props.sortBy.property !== "" ? `_sorted-by-${this.props.sortBy.sortOrder === "asc" ? "ascending" : "descending"}-${this.props.sortBy.property.replaceAll(/[._]/g, '-')}`: ""}.csv`;
            
            let downloader = document.createElement('a'); //create a link
            downloader.setAttribute('href', encodeURI(csvContent)); //content to download
            downloader.setAttribute('download', filename); //filename of download
            downloader.click(); //download
        });
    }

    render() {
        let { columns } = this.props;
        let columnData = this.getColumnData(columns);
        let groupedData = this.getGroupedData(this.props.rows);
        const emptyRows = this.props.rowsPerPage - 
            Math.min(this.props.rowsPerPage, groupedData.length);
    
        return (
            <div className="query-results-table-holder">
                <div className="csv-results-group-holder">
                    <div className="csv-results-child" style={{paddingTop: '25px', paddingLeft: '40px'}}>
                        <IconButton style={{padding: '7px', borderRadius: '10px', fontSize: '1rem'}} onClick={this.downloadCSV}>
                            <span className="material-icons">
                                get_app
                            </span>CSV
                        </IconButton>
                    </div>
                    <div className="csv-results-child">
                        <div className="results-group-chooser">
                            <div className="query-builder-label">Group Table By</div>
                            <Select className="results-groupby-selector"
                                defaultValue={{label: this.props.groupBy.label}}
                                value={{label: this.props.groupBy.label}}
                                onChange={this.setQueryGroupBy}
                                options={this.props.groupByOptions}/>
                        </div>
                    </div>
                </div>
                <div className="results-table-scroll">
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell key='result_table_cell_link' className="results-table-header-cell">
                                    Analysis Page Link
                                </TableCell>

                                {columnData.map((item, key) => (
                                    <TableCell key={'result_table_cell_' + key} className="results-table-header-cell">
                                        <TableSortLabel active={this.props.sortBy.property === item.dataKey} direction={this.props.sortBy.sortOrder} 
                                            onClick={this.handleRequestSort.bind(null, item.dataKey)}>{item.title}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.groupBy.value === "" && 
                                <React.Fragment>
                                    {groupedData.map((rowItem, rowKey) => (
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
                                            <TableCell colSpan={columnData.length + 1}/>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            }
                            {this.props.groupBy.value !== "" && 
                                <>
                                    {Object.keys(groupedData).sort().map(key => {return (
                                        <React.Fragment key={"react_frag_row_" + key}>
                                            <TableRow key={"grouped_table_row_" + key}>
                                                <TableCell colSpan={columnData.length + 1}>
                                                    <IconButton onClick={this.expandRow.bind(null, key)}>
                                                        <Icon>
                                                            {this.groups[key] ? "expand_more" : "chevron_right"}
                                                        </Icon>
                                                    </IconButton>
                                                    <span className="grouped_table_row_span">
                                                        {key + " (" + (this.getGroupMetadata(key)).total + ")"}
                                                    </span>
                                                    <PerformanceStatistics resultsData={this.getGroupMetadata(key)}/>
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
                    </Table>  
                </div>
                {this.props.groupBy.value === "" && 
                    <table>
                        <TableFooter className="query-results-footer">
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    colSpan={3}
                                    count={this.props.totalResultCount}
                                    rowsPerPage={this.props.rowsPerPage}
                                    page={this.props.page}
                                    SelectProps={{
                                        inputProps: { 'aria-label': 'rows per page' },
                                        native: true,
                                    }}
                                    onChangePage={this.handleChangePage}
                                    onPageChange={this.handleChangePage}
                                    onRowsPerPageChange={this.handleChangeRowsPerPage}
                                    ActionsComponent={TablePaginationActions}
                                />
                            </TableRow>
                        </TableFooter>
                    </table>
                }
            </div>
        );
    }
}

export default QueryResultsTable;
