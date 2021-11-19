import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const fieldQueryName = "getHistorySceneFieldAggregation";
const getFieldForEvalAndCategory = gql`
    query getHistorySceneFieldAggregation($fieldName: String!, $eval: String, $catType: String){
        getHistorySceneFieldAggregation(fieldName: $fieldName, eval: $eval, catType: $catType) 
  }`;

class ButtonGroupNavItem extends React.Component {

    fieldOptions = [];

    constructor(props) {
        super(props);
        this.state = {
            fieldName: this.props.fieldName
        }
        this.updateSelectedField = this.updateSelectedField.bind(this);
        this.checkFieldLoaded = this.checkFieldLoaded.bind(this);
    }

    updateSelectedField(fieldName, item) {
        this.props.stateUpdateHandler(fieldName, item);
    }

    checkFieldLoaded() {
        const checkInArray = this.fieldOptions.find(ele => ele === this.props.state[this.props.fieldName]);
        if((this.props.state[this.props.fieldName] === "" && this.fieldOptions.length > 0) || (checkInArray === undefined && this.fieldOptions.length > 0)) {
            this.updateSelectedField(this.props.fieldName, this.fieldOptions[0]);
            clearInterval(this.intervalMethodCategory);
        }
    }

    componentDidMount() {
        this.intervalMethodCategory = setInterval(this.checkFieldLoaded, 100);
    }

    componentWillUnmount() {
        clearInterval(this.intervalMethodCategory);
    }

    componentDidUpdate() {
        setTimeout(() => {this.checkFieldLoaded();},100);
    }

    checkSelected(item) {
        return this.props.state[this.props.fieldName] === item;
    }

    render() {
        return (
            <Query query={getFieldForEvalAndCategory} variables={{
                "fieldName": this.props.fieldName, 
                "eval": this.props.state.eval,
                "catType": this.props.state.category}}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    this.fieldOptions = data[fieldQueryName].sort();
                    this.fieldOptions.sort((a, b) => (a > b) ? 1 : -1);

                    return (
                        <div className="metadata-group btn-group" role="group">
                            {this.fieldOptions.map((fieldProp, key) =>
                                <button className={this.checkSelected(fieldProp) ? 'btn btn-primary active' : 'btn btn-secondary'}
                                        id={'toggle_metadata_' + key} key={'toggle_' + fieldProp} type="button"
                                        onClick={() => this.updateSelectedField(this.props.fieldName, fieldProp)}>
                                    {fieldProp}
                                </button>
                            )}
                        </div>
                    )
                }
            }
            </Query>
        );
    }
}

export default ButtonGroupNavItem;