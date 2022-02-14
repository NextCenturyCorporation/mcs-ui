import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';

const collectionFieldsQueryName = "getCollectionFields";

const all_collection_fields = gql`
    query getCollectionFields($collectionName: String!){
        getCollectionFields(collectionName: $collectionName) {
            value 
            label
        }
    }`;

const BasicFieldDropDown = ({onSelectHandler, options, isDisabled}) => {
    return(
        <div className="query-collection-selector">
            <div className="query-builder-label">Field</div>
            <Select
                onChange={onSelectHandler}
                options={options}
                placeholder="Select a field..."
                isDisabled={isDisabled}
            />
        </div>
    );
}

const CollectionFieldDropDown = ({collectionName, onSelectHandler}) => {
    return (
        <Query query={all_collection_fields} variables={{"collectionName": collectionName}}> 
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const options = data[collectionFieldsQueryName].sort((a, b) => (a.label > b.label) ? 1 : -1);

                return (
                    <BasicFieldDropDown onSelectHandler={onSelectHandler} options={options} isDisabled={false}/>
                )
            }
        }
        </Query>
    );
};

const FieldSelector =({fieldType, onSelectHandler}) => {
    if(fieldType !== undefined && fieldType !== "") {
        return(<CollectionFieldDropDown collectionName={fieldType} onSelectHandler={onSelectHandler}/>);
    } else {
        return(<BasicFieldDropDown options={{}} isDisabled={true}/>)
    }
};

class FieldDropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div style={{zIndex:'11'}} className="query-field-selector">
                <FieldSelector fieldType={this.props.fieldTypeLabel} onSelectHandler={this.props.selectFieldHandler}/>
            </div>
        );
    }
}

export default FieldDropdown;