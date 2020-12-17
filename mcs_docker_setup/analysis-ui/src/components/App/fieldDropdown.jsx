import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';

const allHistoryQueryName = "getAllHistoryFields";
const allSceneQueryName = "getAllSceneFields";

const all_history_fields = gql`
    query getAllHistoryFields{
        getAllHistoryFields {
            value 
            label
        }
    }`;

const all_scene_fields = gql`
    query getAllSceneFields{
        getAllSceneFields {
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

const HistoryFieldDropDown = ({onSelectHandler}) => {
    return (
        <Query query={all_history_fields} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const options = data[allHistoryQueryName].sort((a, b) => (a.label > b.label) ? 1 : -1);

                return (
                    <BasicFieldDropDown onSelectHandler={onSelectHandler} options={options} isDisabled={false}/>
                )
            }
        }
        </Query>
    );
};

const SceneFieldDropDown = ({onSelectHandler}) => {
    return (
        <Query query={all_scene_fields} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>Loading ...</div> 
                if (error) return <div>Error</div>
                
                const options = data[allSceneQueryName].sort((a, b) => (a.label > b.label) ? 1 : -1);

                return (
                    <BasicFieldDropDown onSelectHandler={onSelectHandler} options={options} isDisabled={false}/>
                )
            }
        }
        </Query>
    );
}

const FieldSelector =({fieldType, onSelectHandler}) => {
    if(fieldType.indexOf('mcs_history') > -1) {
        return(<HistoryFieldDropDown onSelectHandler={onSelectHandler}/>);
    } else if (fieldType.indexOf('mcs_scenes') > -1) {
        return(<SceneFieldDropDown onSelectHandler={onSelectHandler}/>);
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
            <div className="query-field-selector">
                <FieldSelector fieldType={this.props.fieldType} onSelectHandler={this.props.selectFieldHandler}/>
            </div>
        );
    }
}

export default FieldDropdown;