import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { LinkContainer } from 'react-router-bootstrap';
import Search from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import _ from "lodash";

const GET_FIELD_AGG = gql`
    query getFieldAggregation($fieldName: String!){
        getFieldAggregation(fieldName: $fieldName) 
  }`;

const GET_HISTORY_FIELD_AGG = gql`
    query getHistoryCollectionMapping{
        getHistoryCollectionMapping
  }`;

const GET_HISTORY_FIELD_AGG_WITH_EVAL = gql`
    query getHistorySceneFieldAggregation($fieldName: String!, $eval: String){
        getHistorySceneFieldAggregation(fieldName: $fieldName, eval: $eval) 
  }`;

const GET_HISTORY_FIELD_AGG_WITH_EVAL_AND_CAT_TYPE = gql`
    query getHistorySceneFieldAggregation($fieldName: String!, $eval: String, $catType: String) {
        getHistorySceneFieldAggregation(fieldName: $fieldName, eval: $eval, catType: $catType) 
    }`;

const EVAL_2_IDENTIFIER = "eval_2_results";

class NavListItem extends React.Component {

    updateState(item, stateName) {
        if(this.props.state[stateName] !== item) {
            this.props.state[stateName] = item;
            this.props.updateHandler(stateName, item);
        }
    }

    checkSelected() {
        if(this.props.stateName === 'test_num') {
            return this.props.state[this.props.stateName] === this.props.item.toString();
        } else if (this.props.stateName === 'eval') {
            return this.props.state[this.props.stateName] === this.props.item.value;
        } else {
            return this.props.state[this.props.stateName] === this.props.item;
        }
    }

    render() {
        let params = ""
    
        // Property List for Eval 2 Going Forward
        let hasEvalState = this.props.state["eval"] !== undefined && this.props.state["eval"] !== null;
        let isEval2 = hasEvalState && this.props.state["eval"] === EVAL_2_IDENTIFIER
        let isNotEval2 = hasEvalState && this.props.state["eval"] !== EVAL_2_IDENTIFIER
        let hasCatTypePairState = this.props.state["cat_type_pair"] !== undefined && this.props.state["cat_type_pair"] !== null;
        let hasCatTypeState = this.props.state["category_type"] !== undefined && this.props.state["category_type"] !== null;
        let hasTestNumState = this.props.state["test_num"] !== undefined && this.props.state["test_num"] !== null;
        let paramsToAppend = '';

        if(this.props.stateName === 'eval') {
            // We have 2 cases: "eval 2" and "every other eval"
            // don't append other params if picking a different eval (old params likely don't apply)
            params = "?eval=" + this.props.item.value;
        } else if(isEval2 && this.props.stateName === 'cat_type_pair') {

            paramsToAppend += "&cat_type_pair=" + this.props.item;

            if(hasTestNumState) {
                paramsToAppend += "&test_num=" + this.props.state["test_num"];
            }

            params = "?eval=" + this.props.state["eval"] + paramsToAppend;
        } else if(isNotEval2 && this.props.stateName === 'category_type') {

            paramsToAppend += "&category_type=" + this.props.item;

            if(hasTestNumState) {
                paramsToAppend += "&test_num=" + this.props.state["test_num"];
            }

            params = "?eval=" + this.props.state["eval"] + paramsToAppend;
        } else if(hasEvalState && this.props.stateName === 'test_num') {
            if(hasCatTypePairState && isEval2) {
                paramsToAppend += "&cat_type_pair=" + this.props.state["cat_type_pair"];
            } else if(hasCatTypeState && isNotEval2) {
                paramsToAppend += "&category_type=" + this.props.state["category_type"];
            }

            paramsToAppend += "&test_num=" + this.props.item;

            params = "?eval=" + this.props.state["eval"] + paramsToAppend;
        }

        const newLocation = '/analysis' + params;

        const listItemValue = this.props.item.value !== undefined ? this.props.item.value : this.props.item;
        const listItemlabel = this.props.item.label !== undefined ? this.props.item.label : this.props.item;
    
        return (
            <LinkContainer to={newLocation}>
                <ListItem className="nav-list-item" id={this.props.stateName + "_" + this.props.itemKey}
                    button
                    selected={this.checkSelected()}
                    onClick={() => this.updateState(listItemValue, this.props.stateName)}>
                    <ListItemText primary={_.startCase(listItemlabel)} />
                </ListItem>
            </LinkContainer>
        )
    }
}

class NavList extends React.Component {

    constructor() {
        super();

        this.state = {
            filterText: ''
        }

        this.onFilterChange = this.onFilterChange.bind(this);
    }

    onFilterChange(event) {
        this.setState({filterText: event.target.value});
    }

    filterCheck(item) {
        return (item.toString().toUpperCase().includes(this.state.filterText.toUpperCase()) || this.state.filterText === '');
    }

    hasEval2Properties() {
        return this.props.state.eval === EVAL_2_IDENTIFIER && this.props.state.cat_type_pair;
    }

    render() {
        let queryName = GET_FIELD_AGG;
        let headerText = this.props.title;
        let variablesToQuery = {"fieldName": this.props.fieldName};
        let dataName = "getFieldAggregation";

        if(this.props.fieldName === 'eval') {
            queryName = GET_HISTORY_FIELD_AGG;
            dataName = "getHistoryCollectionMapping";
            variablesToQuery['eval'] = null;
        } else if((this.props.fieldName === 'cat_type_pair' || this.props.fieldName === 'category_type') && this.props.state.eval) {
            variablesToQuery['eval'] = this.props.state.eval;

            queryName = GET_HISTORY_FIELD_AGG_WITH_EVAL;
            dataName = "getHistorySceneFieldAggregation";
        } else if(this.props.fieldName === 'test_num' && this.props.state.eval && 
                (this.props.state.category_type || this.props.state.cat_type_pair)) {
            variablesToQuery['eval'] = this.props.state.eval;
            variablesToQuery['catType'] = this.hasEval2Properties() ? this.props.state.cat_type_pair : this.props.state.category_type;

            queryName = GET_HISTORY_FIELD_AGG_WITH_EVAL_AND_CAT_TYPE;
            dataName = "getHistorySceneFieldAggregation";
        }

        return(
            <div className="nav-section">
                <div className="nav-header">
                    <span className="nav-header-text">{headerText}</span>
                </div>
                <Query query={queryName} variables={variablesToQuery}>
                {
                    ({ loading, error, data }) => {
                        if (loading) return <div>Loading ...</div> 
                        if (error) return <div>Error</div>
                        let options = [];
                        
                        if(data !== undefined && dataName !== "getSubmissionFieldAggregation") {
                            options = data[dataName];
                        } else if (data !== undefined ) {
                            for(let i=0; i < data[dataName].length; i++) {
                                options.push(data[dataName][i].key.performer + "/" + data[dataName][i].key.submission);
                            }
                        }

                        if(this.props.fieldName === "eval") {
                            options.sort((a, b) => (a.label < b.label) ? 1 : -1)
                        }

                        if(this.props.hasFilter) {
                            return (
                                <>
                                    <TextField
                                        className="nav-filter"
                                        id="input-with-icon-textfield"
                                        value={this.state.filterText}
                                        onChange={this.onFilterChange}
                                        InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                            <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                    />
                                    <List className="nav-list" component="nav" aria-label="secondary mailbox folder">
                                        {options.filter((item) => this.filterCheck(item)).map((item,key) =>
                                                <NavListItem stateName={this.props.stateName} state={this.props.state} 
                                                    item={item} itemKey={key} key={this.props.stateName + "_" + key} updateHandler={this.props.updateHandler}/>
                                            )}
                                    </List>
                                </>
                            )
                        } else {
                            return (
                                <List className="nav-list" component="nav" aria-label="secondary mailbox folder">
                                    {options.map((item,key) =>
                                        <NavListItem stateName={this.props.stateName} state={this.props.state} 
                                            item={item} itemKey={key} key={this.props.stateName + "_" + key} updateHandler={this.props.updateHandler}/>
                                    )}
                            </List>
                            )
                        }
                    }
                }
                </Query>
            </div>
        );
    }
}

class EvalNav extends React.Component {
    render() {
        return(
            <>
                <NavList title={"Evaluation"}
                    id="basic-nav-dropdown" fieldName={"eval"} stateName={"eval"} state={this.props.state} updateHandler={this.props.updateHandler}/>

                {(this.props.state.eval !== undefined && this.props.state.eval !== null && this.props.state.eval !== EVAL_2_IDENTIFIER) &&
                    <NavList title={"Category Type"}
                        id="basic-nav-dropdown" fieldName={"category_type"} stateName={"category_type"} hasFilter={true} state={this.props.state} updateHandler={this.props.updateHandler}/>
                }

                {(this.props.state.eval !== undefined && this.props.state.eval !== null && this.props.state.eval === EVAL_2_IDENTIFIER) &&
                    <NavList title={"Category Type w/Pair"}
                        id="basic-nav-dropdown" fieldName={"cat_type_pair"} stateName={"cat_type_pair"} hasFilter={true} state={this.props.state} updateHandler={this.props.updateHandler}/>
                }

                {(this.props.state.eval !== undefined && this.props.state.eval !== null && 
                ((this.props.state.eval === EVAL_2_IDENTIFIER && this.props.state.cat_type_pair !== undefined && this.props.state.cat_type_pair !== null) ||
                (this.props.state.eval !== EVAL_2_IDENTIFIER && this.props.state.category_type !== undefined && this.props.state.category_type !== null))) &&
                    <NavList title={"Test Number"}
                        id="basic-nav-dropdown" fieldName={"test_num"} stateName={"test_num"} hasFilter={true} state={this.props.state} updateHandler={this.props.updateHandler}/>
                }
            </>
        );
    }
}

class Navigation extends React.Component {
    render() {
        return (
            <div className="nav-menu">
                <EvalNav state={this.props.state} updateHandler={this.props.updateHandler}/>
            </div>
        );
    }
}

export default Navigation;