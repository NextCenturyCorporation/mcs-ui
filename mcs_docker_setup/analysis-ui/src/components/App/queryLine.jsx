import React from 'react';
import FieldValuesDropdown from './fieldValuesDropdown';
import FieldDropdown from './fieldDropdown';
import Button from 'react-bootstrap/Button';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Select from 'react-select';

const functionOptions = [
    {value: "equals", label: "equals"},
    {value: "contains", label: "contains"},
    {value: "does_not_contain", label: "does not contain"},
    {value: "between", label: "between"},
    {value: "and", label: "and"},
    {value: "or", label: "or"},
    {value: "greater_than", label: "greater than"},
    {value: "less_than", label: "less than"}
];

const getCollectionsName = "getScenesAndHistoryTypes";
const GET_COLLECTIONS = gql`
    query getScenesAndHistoryTypes{
        getScenesAndHistoryTypes  {
            value 
            label
        }
    }`;

const CollectionsDropdown = ({selectCollection, fieldValue, collectionDropdownToggle}) => {
    return (
        <Query query={GET_COLLECTIONS}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const options = data[getCollectionsName].sort((a, b) => (a.label > b.label) ? 1 : -1);

                return (
                    <div className="query-collection-selector">
                        <div className="query-builder-label">Collection</div>
                        <Select
                            key={`my_unique_select_key__${collectionDropdownToggle}`}
                            onChange={selectCollection}
                            options={options}
                            placeholder="Select a collection..."
                            defaultValue={fieldValue}
                        />
                    </div>
                )
            }
        }
        </Query>
    );
}

const FunctionsDropdown = ({onFunctionSelect, functionValue, collectionDropdownToggle}) => {
    const options = functionOptions.sort((a, b) => (a.label > b.label) ? 1 : -1);
    let defaultValue;

    for(let i=0; i < options.length; i ++) {
        if(options[i].value === functionValue) {
            defaultValue = options[i];
        }
    }

    return(
        <div className="query-function-selector">
            <div className="query-builder-label">Function</div>
            <Select
                key={`my_unique_select_key__${collectionDropdownToggle}`}
                onChange={onFunctionSelect}
                options={options}
                placeholder="Select a function..."
                defaultValue={defaultValue}
            />
        </div>
    );
}

class QueryLineItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fieldType: "",
            fieldTypeLabel: "",
            fieldName: "",
            fieldNameLabel: "",
            fieldValue1: "",
            fieldValue2: "",
            functionOperator: "equals",
            collectionDropdownToggle: 0
        };

        this.selectCollection = this.selectCollection.bind(this);
        this.selectField = this.selectField.bind(this);
        this.selectFieldValue1 = this.selectFieldValue1.bind(this);
        this.selectFieldValue2 = this.selectFieldValue2.bind(this);
        this.selectFunction = this.selectFunction.bind(this);
        this.selectDropDownValue = this.selectDropDownValue.bind(this);
    }

    selectCollection = (event) => {
        this.setState({ fieldType: event.value, fieldTypeLabel: event.label});
    }

    selectField = (event) => {
        this.setState({fieldName: event.value, fieldNameLabel: event.label});
    }

    selectDropDownValue = (event) => {
        let valueToSet = "";
        for(let i=0; i < event.length; i ++){
            valueToSet = valueToSet + event[i].value;
            if(i < event.length -1) {
                valueToSet = valueToSet + "__,__"
            }
        }

        this.setState({fieldValue1: valueToSet});
    }

    selectFieldValue1 = ({target}) => {
        if(target !== undefined) {
            this.setState({fieldValue1: target.value});
        }
    }

    selectFieldValue2 = ({target}) => {
        if(target !== undefined) {
            this.setState({fieldValue2: target.value});
        }
    }

    selectFunction = (event) => {
        this.setState({functionOperator: event.value});
    }

    addQueryParameters = () => {
        this.props.queryLineHandler(this.state);
        this.setState({
            fieldType: "",
            fieldName: "",
            fieldValue1: "",
            fieldValue2: "",
            functionOperator: "equals",
            collectionDropdownToggle: this.state.collectionDropdownToggle === 0 ? 1 : 0
        });
    }

    render() {
        return (
            <>
                <CollectionsDropdown selectCollection={this.selectCollection} fieldValue={this.state.fieldType} collectionDropdownToggle={this.state.collectionDropdownToggle}/>
                <span className="material-icons query-add-spacer">add</span>
                <FieldDropdown fieldType={this.state.fieldType} selectFieldHandler={this.selectField}/>
                <span className="material-icons query-add-spacer">add</span>
                <FunctionsDropdown onFunctionSelect={this.selectFunction} functionValue={this.state.functionOperator} collectionDropdownToggle={this.state.collectionDropdownToggle}/>
                <span className="material-icons query-add-spacer">add</span>
                <FieldValuesDropdown fieldType={this.state.fieldType} fieldName={this.state.fieldName} selectFieldValueHandler1={this.selectFieldValue1}
                    selectFieldValueHandler2={this.selectFieldValue2} functionOperator={this.state.functionOperator} selectDropDownValue={this.selectDropDownValue}/>
                <Button variant="primary" className="query-add-param-btn" onClick={this.addQueryParameters}>Add Parameter</Button>
            </>
        );
    }
}

export default QueryLineItem;