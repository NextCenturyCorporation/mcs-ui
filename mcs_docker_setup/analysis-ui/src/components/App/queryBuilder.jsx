import React from 'react';
import QueryLineItem from './queryLine';
import Button from 'react-bootstrap/Button';
import QueryResults from './queryResults';

class ComplexQueryBuilder extends React.Component {

    constructor() {
        super();

        this.queryLineHandler = this.queryLineHandler.bind(this);

        this.querylineCounter = 1;
        this.queryObject={};

        const currentRowNumber = this.querylineCounter.valueOf();

        this.displayQueryLines = [<div className="query-item" key={'query-item-' + this.querylineCounter}>
            <QueryLineItem querylineCounter={this.querylineCounter} queryLineHandler={this.queryLineHandler}/>
            <Button variant="outline-secondary" onClick={() => this.removeQueryRow(currentRowNumber)}>Remove</Button>
        </div>];

        this.state = {
            showDisplayQueryLines: this.displayQueryLines,
            stateQueryObject: {}
        }
    }

    submitSearch = () => {
        this.setState({stateQueryObject: this.queryObject});
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
        const currentRowNumber = this.querylineCounter.valueOf();
        this.displayQueryLines.push(<div className="query-item" key={'query-item-' + this.querylineCounter}>
            <QueryLineItem querylineCounter={this.querylineCounter} queryLineHandler={this.queryLineHandler}/>
            <Button variant="outline-secondary" onClick={() => this.removeQueryRow(currentRowNumber)}>Remove</Button>
        </div>);
        this.setState({
            showDisplayQueryLines : this.displayQueryLines
        });
    }

    queryLineHandler(lineCounter, qlObj) {
        this.queryObject[lineCounter] = qlObj;
    }

    render() {
        return (
            <div>
                <h3>Query Builder</h3>
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