import React from 'react';
import QueryLineItem from './queryLine';
import Button from 'react-bootstrap/Button';
import QueryResults from './queryResults';
import SaveQuery from './saveQuery';

class ComplexQueryBuilder extends React.Component {

    constructor() {
        super();

        this.queryLineHandler = this.queryLineHandler.bind(this);
        this.clearQuery = this.clearQuery.bind(this);

        this.querylineCounter = 1;
        this.queryObject={};
        this.showModal = false;

        this.displayQueryLines = [this.getBaseQueryLine(this.querylineCounter.valueOf())];

        this.state = {
            showDisplayQueryLines: this.displayQueryLines,
            stateQueryObject: {},
            showModal: false
        }
    }

    getBaseQueryLine = (currentRowNumber) => {
        return <div className="query-item" key={'query-item-' + this.querylineCounter}>
            <QueryLineItem querylineCounter={this.querylineCounter} queryLineHandler={this.queryLineHandler}/>
            <Button variant="outline-secondary" onClick={() => this.removeQueryRow(currentRowNumber)}>Remove</Button></div>;
    }

    submitSearch = () => {
        this.setState({stateQueryObject: this.queryObject});
    }

    clearQuery = () => {
        this.querylineCounter += 1;
        this.queryObject={};
        this.displayQueryLines = [this.getBaseQueryLine(this.querylineCounter.valueOf())];

        this.setState({
            saveQueryObject: {},
            stateQueryObject: {},
            showDisplayQueryLines: this.displayQueryLines
        });

        this.props.updateQueryNameHandler(this.props.queryId, "Query " + this.props.queryId);
    }

    removeQueryRow = (querylineCounter) => {
        console.log(this.queryObject);
        for(let i=0; i < this.displayQueryLines.length; i++) {
            if(this.displayQueryLines[i]["key"] === 'query-item-' + querylineCounter) {
                this.displayQueryLines.splice(i,1);
            }
        }

        if(querylineCounter in this.queryObject) {
            delete this.queryObject[querylineCounter];
        }

        this.setState({
            showDisplayQueryLines : this.displayQueryLines
        });
    }

    addQueryRow = () => {
        this.querylineCounter += 1;
        this.displayQueryLines.push(this.getBaseQueryLine(this.querylineCounter.valueOf()));
        this.setState({
            showDisplayQueryLines : this.displayQueryLines
        });
    }

    queryLineHandler(lineCounter, qlObj) {
        this.queryObject[lineCounter] = qlObj;

        this.setState({saveQueryObject: this.queryObject});
    }

    render() {
        return (
            <div>
                <div className="query-controls">
                    <SaveQuery queryObj={this.state.saveQueryObject} currentUser={this.props.currentUser}
                        queryId={this.props.queryId} updateQueryNameHandler={this.props.updateQueryNameHandler}/>
                    <a href="#clearQueryLink" onClick={this.clearQuery} className="icon-link">
                        <span className="material-icons icon-margin-left">
                            settings_backup_restore
                        </span>
                        <span className="icon-link-text">Clear</span>
                    </a>
                </div>
                <div className="query-builder-holder">
                    {this.displayQueryLines}
                </div>
                <div>
                    <Button variant="outline-secondary" onClick={this.addQueryRow}>Add</Button>
                    <Button variant="outline-secondary" onClick={this.submitSearch}>Search</Button>
                </div>
                <div>
                    <QueryResults queryObj={this.state.stateQueryObject}/>
                </div>
            </div>
        );
    }
}

export default ComplexQueryBuilder;