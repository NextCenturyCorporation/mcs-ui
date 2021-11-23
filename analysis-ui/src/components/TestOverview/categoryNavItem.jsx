import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import _ from "lodash";

const categoryFieldQueryName = "getHistorySceneFieldAggregation";
const get_category_for_eval = gql`
    query getHistorySceneFieldAggregation($fieldName: String!, $eval: String){
        getHistorySceneFieldAggregation(fieldName: $fieldName, eval: $eval) 
  }`;

let categoryOptions = [];

class CategoryNavItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            category: this.props.state.category
        }
        this.updateSelectedEval = this.updateSelectedEval.bind(this);
        this.checkCategoriesLoaded = this.checkCategoriesLoaded.bind(this);
    }

    updateSelectedEval(item) {
        this.props.stateUpdateHandler("category", item);
    }

    checkCategoriesLoaded() {
        const checkInArray = categoryOptions.find(ele => ele === this.props.state.category);
        if((this.props.state.category === "" && categoryOptions.length > 0) || (checkInArray === undefined && categoryOptions.length > 0)) {
            this.updateSelectedEval(categoryOptions[0]);
            clearInterval(this.intervalMethodCategory);
        }
    }

    componentDidMount() {
        this.intervalMethodCategory = setInterval(this.checkCategoriesLoaded, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalMethodCategory);
    }

    componentDidUpdate() {
        setTimeout(() => {this.checkCategoriesLoaded();},100);
    }

    checkSelected(item) {
        return this.props.state.category === item;
    }

    render() {
        categoryOptions = [];
        return (
            <Query query={get_category_for_eval} variables={{"fieldName": "category_type", "eval": this.props.state.eval}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    categoryOptions = data[categoryFieldQueryName].sort();
                    categoryOptions.sort((a, b) => (a > b) ? 1 : -1);

                    return (
                        <List className="nav-list" component="nav" aria-label="secondary mailbox folder">
                            {categoryOptions.map((item,key) =>
                                <ListItem className="nav-list-item" id={"category_" + key} key={"category_" + key}
                                    button
                                    selected={this.checkSelected(item)}
                                    onClick={() => this.updateSelectedEval(item)}>
                                    <ListItemText primary={_.startCase(item)} />
                                </ListItem>
                            )}
                        </List>
                    )
                }
            }
            </Query>
        );
    }
}

export default CategoryNavItem;