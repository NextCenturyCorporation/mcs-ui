import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';

const historyFieldQueryName = "getHistorySceneFieldAggregation";
const sceneFieldQueryName = "getSceneFieldAggregation";

const history_field_aggregation = gql`
    query getHistorySceneFieldAggregation($fieldName: String!, $eval: String!){
        getHistorySceneFieldAggregation(fieldName: $fieldName, eval: $eval) 
  }`;

const scene_field_aggregation= gql`
    query getSceneFieldAggregation($fieldName: String!, $eval: String!){
        getSceneFieldAggregation(fieldName: $fieldName, eval: $eval) 
  }`;

const convertArrayToArrayObject = (arrayToConvert) => {
    let newArray = [];
    for(let i=0; i < arrayToConvert.length; i++) {
        if(arrayToConvert[i] !== null &&  arrayToConvert[i] !== undefined) {
            newArray.push({value: arrayToConvert[i], label: arrayToConvert[i].toString()});
        }
    }

    return newArray.sort((a, b) => (a.label > b.label) ? 1 : -1);
};

const BasicFieldDropDown = ({onSelectHandler, options, isDisabled}) => {
    return(
        <div className="query-collection-value-selector">
            <div className="query-builder-label">Value</div>
            <Select
                onChange={onSelectHandler}
                options={options}
                placeholder="Select a value..."
                isDisabled={isDisabled}
                isMulti
            />
        </div>
    );
}

const HistoryFieldValueDropDown = ({fieldName, selectFieldValueHandler, evalName}) => {
    return (
        <Query query={history_field_aggregation} variables={{"fieldName": fieldName, "eval": evalName}}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const historyData = data[historyFieldQueryName];
                const options = convertArrayToArrayObject(historyData);

                return (
                    <BasicFieldDropDown onSelectHandler={selectFieldValueHandler} options={options} isDisabled={false}/>
                )
            }
        }
        </Query>
    );
};

const SceneFieldValueDropDown = ({fieldName, selectFieldValueHandler,  evalName}) => {
    return (
        <Query query={scene_field_aggregation} variables={{"fieldName": fieldName, "eval": evalName}}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const sceneData = data[sceneFieldQueryName];
                const options = convertArrayToArrayObject(sceneData);

                return (
                    <BasicFieldDropDown onSelectHandler={selectFieldValueHandler} options={options} isDisabled={false}/>
                )
            }
        }
        </Query>
    );
}

const FieldDropdownSelector =({fieldType, fieldName, selectFieldValueHandler}) => {
    const evalName = fieldType.substring(fieldType.indexOf('.') + 1);
    if(fieldType.indexOf('results') > -1 && fieldName !== "") {
        return(<HistoryFieldValueDropDown fieldName={fieldName} selectFieldValueHandler={selectFieldValueHandler} evalName={evalName}/>);
    } else if (fieldType.indexOf('scenes') > -1 && fieldName !== "") {
        return(<SceneFieldValueDropDown fieldName={fieldName} selectFieldValueHandler={selectFieldValueHandler} evalName={evalName}/>);
    } else {
        return(<BasicFieldDropDown options={{}} isDisabled={true}/>)
    }
};

class FieldValuesDropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <>
                {(this.props.functionOperator === "equalsDropdown" || this.props.functionOperator === "equalsDropdown") &&
                    <div className="query-field-value-selector-equals">
                        <FieldDropdownSelector fieldType={this.props.fieldType} fieldName={this.props.fieldName} selectFieldValueHandler={this.props.selectDropDownValue}/>
                    </div>
                }
                {(this.props.functionOperator === "contains" || this.props.functionOperator === "does_not_contain" ||
                    this.props.functionOperator === "greater_than" || this.props.functionOperator === "less_than" ||
                    this.props.functionOperator === "equalsInput") &&
                    <div className="query-field-value-selector">
                        <div className="query-builder-label">Value</div>
                        <input className="form-control query-field-input" placeholder="Enter a value..." type="text" onChange={this.props.selectFieldValueHandler1}/>
                    </div>
                }
                {(this.props.functionOperator === "between" || this.props.functionOperator === "and" ||
                    this.props.functionOperator === "or") &&
                    <>
                        <div className="query-field-value-selector">
                            <div className="query-builder-label">Value 1</div>
                            <input className="form-control query-field-input" placeholder="Enter a value..." type="text" onChange={this.props.selectFieldValueHandler1}/>
                        </div>
                        <div className="query-multi-operator">{this.props.functionOperator}</div>
                        <div className="query-field-value-selector">
                            <div className="query-builder-label">Value 2</div>
                            <input className="form-control query-field-input" placeholder="Enter a value..." type="text" onChange={this.props.selectFieldValueHandler2}/>
                        </div>
                    </>
                }
            </>
        );
    }
}

export default FieldValuesDropdown;