import React, { useState } from "react";
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
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from '@material-ui/core/Button'
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

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

function SearchCategoryOption ({searchCategory, setTitle}) {
    return (
        <NavDropdown.Item eventKey={searchCategory.dataKey} onClick={()=> setTitle(searchCategory.title)}> 
            {searchCategory.title}
        </NavDropdown.Item>
    )
}

const theme = createTheme({
    palette: {
      primary: {
            main:"rgba(0, 123, 255, 0.8)",
        },
    }
  });

function QueryResultsSearchBar({setSearch, searchCategories, setSearchCategory, searchAllRows, setSearchAllRows}) {
    const [searchTitle, setTitle] = useState('All Categories');
    const [searchInputTextValue, setSearchInputTextValue] = useState('');

    let searchCategoriesCopy = [...searchCategories]
    searchCategoriesCopy.unshift({dataKey: "all", title: "All Categories"})

    return (
        <div className="table-query-search-container">
            <div className="table-query-search-container">
                <span className="material-icons icon-margin-left" style={{paddingRight: "5px", paddingTop: "7px", borderBottom: "1px solid", borderBottomStyle:"inset"}}>
                        search
                </span>
                <input className="table-query-search-bar" type="text" id="loadQuerySearchBar" placeholder="Search..." onChange={(e)=>setSearchInputTextValue(e.target.value)}/>
            </div>
            <MuiThemeProvider theme={theme}>
                <Button style={{borderRadius:"20px"}} variant={"outlined"}  size="small" color="primary" disableElevation onClick={()=>setSearch(searchInputTextValue)}>Search</Button>
                <div style={{paddingLeft:"10px"}}/>
                <Button style={{borderRadius:"20px"}} size="small" variant={searchAllRows?"contained":"outlined"} color="primary" disableElevation onClick={()=>setSearchAllRows()}>All Rows</Button>
            </MuiThemeProvider>
            <NavDropdown title={searchTitle} id="querySearchCategoryDropdown" onSelect={()=> console.log("hello there")} searchCategories={searchCategories} onSelect={setSearchCategory}>
            {
                searchCategoriesCopy.map((searchCategory, key) => {
                    return(<SearchCategoryOption key={`searchCategory-${key}`} searchCategory={searchCategory} setTitle={setTitle}/>
                    )})
            }
            </NavDropdown>
        </div>
    )
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
            rowsPerPage: 10,
            search: "",
            searchCategory: "all",
            searchAllRows: false
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
        if(item.scene.test_type && item.scene_num) {
            return "/analysis?eval=" + item.eval + "&test_type=" + item.scene.test_type + "&test_num=" + item.test_num + "&scene=" + item.scene_num;
        } else {
            // Eval 3 - use category_type
            return "/analysis?eval=" + item.eval + "&category_type=" + item.category_type + "&test_num=" + item.test_num + "&scene=" + item.scene_num;
        }
    }

    downloadCSV = () => {
        let { rows, columns } = this.props;
        let columnData = this.getColumnData(columns);
        let groupedData = this.getGroupedData(rows);

        let columnDelimiter = '\t';
        let rowDelimter = '\n';
        let csvString = ''; //append all content to this really long string

        let keysToCSV = []
        let titles = [];


        if(this.state.groupBy !== "") {
            titles.push("Group Table By");
            titles.push("Group");
        }

        columnData.forEach(item => {
            keysToCSV.push(item.dataKey);
            titles.push(item.title);
        });
    
        if(this.state.groupBy === "") {
            let stats = getStats(groupedData);
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
        if(this.state.groupBy === "") {
            groupedData.forEach(data => {
                appendDataStringToCSV(data);
            });
        } else {
            columnData.forEach(item => {
                if(item.dataKey === this.state.groupBy)
                    groupByTitle = item.title
            });
            const groupedByObjectsAsArray = Object.entries(groupedData);
            groupedByObjectsAsArray.forEach(groupedByObject => {
                let stats = getStats(groupedByObject[1]);
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
        let filename = `mcs-query-results${this.state.groupBy !== "" ? "-" + _.kebabCase(groupByTitle) : ""}.csv`;
        
        let downloader = document.createElement('a'); //create a link
        downloader.setAttribute('href', csvContent); //content to download
        downloader.setAttribute('download', filename); //filename of download
        downloader.click(); //download
    }

    setSearch = (search) => {
        this.setState({search:search});
    }

    setSearchCategory = (category) => {
        this.setState({searchCategory:category});
    }

    setSearchAllRows = () => {
        this.setState({searchAllRows:!this.state.searchAllRows});
    }

    parseSearch = (rowItem, columnData) => {
        const searchContains = text => text!==undefined && text.toString().toLowerCase().includes(this.state.search.toLowerCase());
        
        for (let i=0; i<columnData.length; i++) {
            let columnItemText = _.get(rowItem, columnData[i].dataKey);
            columnItemText = Array.isArray(columnItemText) ? columnItemText[0] : columnItemText;
            if(this.state.searchCategory !== "all" && columnData[i].dataKey === this.state.searchCategory && searchContains(columnItemText)) {
                return true;
            }
            else if (this.state.searchCategory === "all" && searchContains(columnItemText)) 
                return true;
        }
        return false;
    }

    groupByParseSearch = (row, columnData) => {
        for(let i=0; i<row.length; i++) {
            let match = this.parseSearch(row[i], columnData);
            if(match === true) 
                return true;
        }
        return false;
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
                <QueryResultsSearchBar setSearch={this.setSearch} searchCategories={columnData} setSearchCategory={this.setSearchCategory} setSearchAllRows={this.setSearchAllRows} searchAllRows={this.state.searchAllRows}/>
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
                                    {(this.state.searchAllRows && this.state.search !== "" ? groupedData : this.state.rowsPerPage > 0 ? 
                                        groupedData.slice(this.state.page * this.state.rowsPerPage, 
                                            this.state.page * this.state.rowsPerPage + this.state.rowsPerPage) : groupedData).map((rowItem, rowKey) => (
                                        this.parseSearch(rowItem, columnData) &&
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
                            {this.state.groupBy !== "" && 
                                <>
                                    {Object.keys(groupedData).sort().map(key => {return (
                                        <React.Fragment key={"react_frag_row_" + key}>
                                            {(this.groupByParseSearch(groupedData[key], columnData)) &&
                                                <TableRow key={"grouped_table_row_" + key}>
                                                    <TableCell colSpan={columnData.length + 1}>
                                                        <IconButton onClick={this.expandRow.bind(null, key)}>
                                                            <Icon>
                                                                {this.groups[key] ? "expand_more" : "chevron_right"}
                                                            </Icon>
                                                        </IconButton>
                                                        <span className="grouped_table_row_span">
                                                            {key + " (" + groupedData[key].length + ")"}
                                                        </span>
                                                        <PerformanceStatistics resultsData={groupedData[key]}/>
                                                    </TableCell>
                                                </TableRow>
                                            }

                                            {this.groups[key] && groupedData[key].map((rowItem, rowKey) => (
                                                (this.parseSearch(rowItem, columnData)) &&
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
                {this.state.groupBy === "" && 
                    <table>
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
