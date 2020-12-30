import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap';

const GET_FIELD_AGG = gql`
    query getFieldAggregation($fieldName: String!){
        getFieldAggregation(fieldName: $fieldName) 
  }`;

const GET_HISTORY_FIELD_AGG = gql`
    query getHistorySceneFieldAggregation($fieldName: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName) 
  }`;

const GET_SUBMISSION_AGG = gql`
    query getSubmissionFieldAggregation{
        getSubmissionFieldAggregation {
            key {
                performer
                submission
            }
        }
  }`;

class ListItem extends React.Component {

    updateState(item, stateName) {
        this.props.state[stateName] = item;
        this.props.updateHandler(stateName, item);
    }

    render() {
        if(this.props.item.includes('/')) {
            let perfSubm = this.props.item.split('/');
            this.props.state["perf"] = perfSubm[0];
            this.props.state['subm'] = perfSubm[1];
        } 

        // TODO: MCS-466: Move URL logic to parent?
        const urlBasePath = window.location.href.split('?')[0];
        let params = ""
    
        // Property List for Eval 1 - TODO: MCS-492: fix for Eval 1 Data?
        if(this.props.state["perf"] !== undefined && this.props.state["perf"] !== null) {
            params = "?perf=" + this.props.state["perf"] + "&subm=" + this.props.state["subm"] + "&block=" + this.props.state["block"] + "&test=" + this.props.state["test"];
        } else {
            // Property List for Eval 2 Going Forward
            if(this.props.stateName === 'test_type') {
                if(this.props.state["scene_num"] !== undefined && this.props.state["scene_num"] !== null) {
                    params = "?test_type=" + this.props.item + "&scene_num=" + this.props.state["scene_num"];
                } else {
                    params = "?test_type=" + this.props.item;
                }
            } else if(this.props.stateName == 'scene_num') {
                if(this.props.state["test_type"] !== undefined && this.props.state["test_type"] !== null) {
                    params = "?test_type=" + this.props.state["test_type"] + "&scene_num=" + this.props.item;
                } else {
                    params = "?scene_num=" + this.props.item;
                }
            }
        }

        const newLocation = '/analysis' + params;

        return (
            <LinkContainer to={newLocation}>
                <NavDropdown.Item id={this.props.stateName + "_" + this.props.itemKey}
                    onSelect={(selectedKey) => this.updateState(this.props.item, this.props.stateName)}>
                    {this.props.item}
                </NavDropdown.Item>
            </LinkContainer>
        )
    }
}

class DropListItems extends React.Component {
    render() {
        let queryName = GET_FIELD_AGG;
        let variablesToQuery = {"fieldName": this.props.fieldName};
        let dataName = "getFieldAggregation";

        if(this.props.fieldName === 'test_type' || this.props.fieldName === 'scene_num') {
            queryName = GET_HISTORY_FIELD_AGG;
            dataName = "getHistorySceneFieldAggregation";
        }

        if(this.props.fieldName === "submission") {
            queryName = GET_SUBMISSION_AGG;
            variablesToQuery = {};
            dataName = "getSubmissionFieldAggregation";
        }

        return(
            <Query query={queryName} variables={variablesToQuery}>
            {
                ({ loading, error, data }) => {
                    let dropdownOptions = [];
                    
                    if(data !== undefined && dataName !== "getSubmissionFieldAggregation") {
                        dropdownOptions = data[dataName];
                    } else if (data !== undefined ) {
                        for(let i=0; i < data[dataName].length; i++) {
                            dropdownOptions.push(data[dataName][i].key.performer + "/" + data[dataName][i].key.submission);
                        }
                    }

                    return (
                        dropdownOptions.map((item,key) =>
                            <ListItem stateName={this.props.stateName} state={this.props.state} item={item} itemKey={key} key={this.props.stateName + "_" + key} updateHandler={this.props.updateHandler}/>
                        )
                    )
                }
            }
            </Query>
        );
    }
}

class EvalNav extends React.Component {
    render() {
        if(this.props.state.perf !== undefined && this.props.state.perf !== null) {
            return(
                <Nav className="mr-auto">
                    <NavDropdown title={"Performer/Submission: " + this.props.state.perf + "/" + this.props.state.subm} id="basic-nav-dropdown">
                        <DropListItems fieldName={"submission"} stateName={"subm"} state={this.props.state} updateHandler={this.props.updateHandler}/>
                    </NavDropdown>
                    <NavDropdown title={"Block: " + this.props.state.block} id="basic-nav-dropdown">
                        <DropListItems fieldName={"block"} stateName={"block"} state={this.props.state} updateHandler={this.props.updateHandler}/>
                    </NavDropdown>
                    <NavDropdown title={"Test: " + this.props.state.test} id="basic-nav-dropdown">
                        <DropListItems fieldName={"test"} stateName={"test"} state={this.props.state} updateHandler={this.props.updateHandler}/>
                    </NavDropdown>
                </Nav>
            );
        } else {
            return(
                <Nav className="mr-auto">
                    <NavDropdown title={"Test Type: " + (this.props.state.test_type === null ? 'None' : this.props.state.test_type)} id="basic-nav-dropdown">
                        <DropListItems fieldName={"test_type"} stateName={"test_type"} state={this.props.state} updateHandler={this.props.updateHandler}/>
                    </NavDropdown>
                    <NavDropdown title={"Test Number: " + (this.props.state.scene_num === null ? 'None' : this.props.state.scene_num)} id="basic-nav-dropdown">
                        <DropListItems fieldName={"scene_num"} stateName={"scene_num"} state={this.props.state} updateHandler={this.props.updateHandler}/>
                    </NavDropdown>
                </Nav>
            );
        }
    }
}

class EvalHeader extends React.Component {

    render() {
        return (
            <Navbar variant="dark" expand="lg">
                <Navbar.Brand href="#home">MCS Analysis</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <EvalNav state={this.props.state} updateHandler={this.props.updateHandler}/>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default EvalHeader;
