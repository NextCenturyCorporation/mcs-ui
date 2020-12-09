import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Dropdown from 'react-dropdown';

const historyFieldQueryName = "getHistorySceneFieldAggregation";
const sceneFieldQueryName = "getSceneFieldAggregation";

const history_field_aggregation = gql`
    query getHistorySceneFieldAggregation($fieldName: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName) 
  }`;

const scene_field_aggregation= gql`
    query getSceneFieldAggregation($fieldName: String!){
        getSceneFieldAggregation(fieldName: $fieldName) 
  }`;

const HistoryFieldValueDropDown = ({fieldName, selectFieldValueHandler}) => {
    return (
        <Query query={history_field_aggregation} variables={{"fieldName": fieldName}} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>No comments yet</div> 
                if (error) return <div>Error</div>
                
                let emptyOptions = [""]
                const options = emptyOptions.concat(data[historyFieldQueryName].sort());
                const defaultOption = options[0];

                return (
                    <Dropdown options={options} onChange={selectFieldValueHandler} value={defaultOption} placeholder="Select a value." />
                )
            }
        }
        </Query>
    );
};

const SceneFieldValueDropDown = ({fieldName, selectFieldValueHandler}) => {
    return (
        <Query query={scene_field_aggregation} variables={{"fieldName": fieldName}} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>No comments yet</div> 
                if (error) return <div>Error</div>
                
                let emptyOptions = [""]
                const options = emptyOptions.concat(data[sceneFieldQueryName].sort());
                const defaultOption = options[0];

                return (
                    <Dropdown options={options} onChange={selectFieldValueHandler} value={defaultOption} placeholder="Select a value." />
                )
            }
        }
        </Query>
    );
}

const FieldDropdownSelector =({fieldType, fieldName, selectFieldValueHandler}) => {
    if(fieldType.toLowerCase() === 'history' && fieldName !== "") {
        return(<HistoryFieldValueDropDown fieldName={fieldName} selectFieldValueHandler={selectFieldValueHandler}/>);
    } else if (fieldType.toLowerCase() === 'scene' && fieldName !== "") {
        return(<SceneFieldValueDropDown fieldName={fieldName} selectFieldValueHandler={selectFieldValueHandler}/>);
    } else {
        return(<Dropdown options={[]}/>)
    }
};

class FieldValuesDropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="query-field-value-selector">
                <FieldDropdownSelector fieldType={this.props.fieldType} fieldName={this.props.fieldName} selectFieldValueHandler={this.props.selectFieldValueHandler}/>
            </div>
        );
    }
}

export default FieldValuesDropdown;