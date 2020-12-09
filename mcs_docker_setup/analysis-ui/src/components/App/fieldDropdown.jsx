import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Dropdown from 'react-dropdown';

const allHistoryQueryName = "getAllHistoryFields";
const allSceneQueryName = "getAllSceneFields";

const all_history_fields = gql`
    query getAllHistoryFields{
        getAllHistoryFields {
            keys
        }
    }`;

const all_scene_fields = gql`
    query getAllSceneFields{
        getAllSceneFields {
            keys
        }
    }`;

const HistoryFieldDropDown = ({onSelectHandler}) => {
    return (
        <Query query={all_history_fields} fetchPolicy={'network-only'}>
        {
            ({ loading, error, data }) => {
                if (loading) return <div>No comments yet</div> 
                if (error) return <div>Error</div>
                
                let emptyOptions = [""]
                const options = emptyOptions.concat(data[allHistoryQueryName]["keys"].sort());
                const defaultOption = options[0];

                return (
                    <Dropdown options={options} onChange={onSelectHandler} value={defaultOption} placeholder="Select a value." />
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
                if (loading) return <div>No comments yet</div> 
                if (error) return <div>Error</div>
                
                let emptyOptions = [""]
                const options = emptyOptions.concat(data[allSceneQueryName]["keys"].sort());
                const defaultOption = options[0];

                return (
                    <Dropdown options={options} onChange={onSelectHandler} value={defaultOption} placeholder="Select a value." />
                )
            }
        }
        </Query>
    );
}

const FieldSelector =({fieldType, onSelectHandler}) => {
    if(fieldType.toLowerCase() === 'history') {
        return(<HistoryFieldDropDown onSelectHandler={onSelectHandler}/>);
    } else if (fieldType.toLowerCase() === 'scene') {
        return(<SceneFieldDropDown onSelectHandler={onSelectHandler}/>);
    } else {
        return(<Dropdown options={[]}/>)
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