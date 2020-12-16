import React from 'react';
import FieldValuesDropdown from './fieldValuesDropdown';
import FieldDropdown from './fieldDropdown';
import Dropdown from 'react-dropdown';
import Button from 'react-bootstrap/Button';

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
        //this.addQueryParameters = this.addQueryParameters(this);
    }

    selectCollection = (event) => {
        this.setState({ fieldType: event.value});
    }

    selectField = (event) => {
        this.setState({fieldName: event.value});
    }

    selectFieldValue = (event) => {
        this.setState({fieldValue: event.value});
        // this.setState({fieldValue: event.value}, () => {
        //     this.props.queryLineHandler(this.props.querylineCounter, this.state);
        // });
    }

    addQueryParameters = () => {
        console.log("add query parameters");
        this.props.queryLineHandler(this.state);
        this.setState({
            fieldType: "",
            fieldName: "",
            fieldValue: ""
        });
    }

    render() {
        return (
            <div className="query-line">
                <Dropdown options={collections} onChange={this.selectCollection} value={this.state.fieldType} placeholder="Select a value." />
                <FieldDropdown fieldType={this.state.fieldType} selectFieldHandler={this.selectField}/>
                <FieldValuesDropdown fieldType={this.state.fieldType} fieldName={this.state.fieldName} selectFieldValueHandler={this.selectFieldValue}/>
                <Button variant="outline-primary" onClick={this.addQueryParameters}>Add Parameter</Button>
            </div>
        );
    }
}

export default QueryLineItem;