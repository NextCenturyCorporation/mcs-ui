import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const historyFieldQueryName = "getHistoryCollectionMapping";
const history_field_aggregation = gql`
    query getHistoryCollectionMapping{
        getHistoryCollectionMapping
  }`;


let evalOptions = [];

class EvalNavItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            eval: this.props.state.eval
        }
        this.updateSelectedEval = this.updateSelectedEval.bind(this);
        this.checkEvalLoaded = this.checkEvalLoaded.bind(this);
    }

    updateSelectedEval(item) {
        this.props.stateUpdateHandler("eval", item);
    }

    checkEvalLoaded() {
        if(this.props.state.eval === "" && evalOptions.length > 0) {
            this.updateSelectedEval(evalOptions[0].value);
            clearInterval(this.intervalMethodEval);
        }
    }

    componentDidMount() {
        this.intervalMethodEval = setInterval(this.checkEvalLoaded, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalMethodEval);
    }

    checkSelected(item) {
        return this.props.state.eval === item;
    }

    render() {
        return (
            <Query query={history_field_aggregation} >
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    evalOptions = data[historyFieldQueryName];
                    evalOptions.sort((a, b) => (a.label < b.label) ? 1 : -1);

                    // Remove Evaluation 2 Results because this page is designed to show hypercube results
                    //    and we did not have a hypercube design for Evaluation 2

                    evalOptions = evalOptions.filter(element => element.label !== "eval_2_results");

                    return (
                        <List className="nav-list" component="nav" aria-label="secondary mailbox folder">
                            {evalOptions.map((item,key) =>
                                <ListItem className="nav-list-item" id={"eval_" + key} key={"eval_" + key}
                                    button
                                    selected={this.checkSelected(item.value)}
                                    onClick={() => this.updateSelectedEval(item.value)}>
                                    <ListItemText primary={item.label} />
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

export default EvalNavItem;