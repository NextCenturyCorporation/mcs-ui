import React from 'react';
import FieldValuesDropdown from './fieldValuesDropdown';
import FieldDropdown from './fieldDropdown';
import Dropdown from 'react-dropdown';

const collections = ['History', 'Scene'];

class QueryLineItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fieldType: "",
            fieldName: "",
            fieldValue: ""
        };

        this.selectField = this.selectField.bind(this);
        this.selectFieldValue = this.selectFieldValue.bind(this);
    }

    selectCollection = (event) => {
        this.setState({ fieldType: event.value});
    }

    selectField = (event) => {
        this.setState({fieldName: event.value});
    }

    selectFieldValue = (event) => {
        this.setState({fieldValue: event.value}, () => {
            this.props.queryLineHandler(this.props.querylineCounter, this.state);
        });
    }

    render() {
        return (
            <div className="query-line">
                <Dropdown options={collections} onChange={this.selectCollection} value={this.state.fieldType} placeholder="Select a value." />
                <FieldDropdown fieldType={this.state.fieldType} selectFieldHandler={this.selectField}/>
                <FieldValuesDropdown fieldType={this.state.fieldType} fieldName={this.state.fieldName} selectFieldValueHandler={this.selectFieldValue}/>
            </div>
        );
    }
}

export default QueryLineItem;