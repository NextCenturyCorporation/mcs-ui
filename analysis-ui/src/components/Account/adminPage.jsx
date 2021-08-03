import React, {useState} from 'react';
import {withRouter} from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import '../../css/adming-page.css';
import DualListBox from 'react-dual-listbox';
import {useMutation} from 'react-apollo';

const getUsersQueryName = "getUsers";
const GET_USERS = gql`
    query getUsers{
        getUsers
  }`;

const UPDATE_ADMIN_USER = gql`
    mutation updateAdminUser($username: String!, $isAdmin: Boolean!){
        updateAdminUser(username: $username, isAdmin: $isAdmin) 
  }`;

function DualInputBox({options, selectedOptions}) {
    const [selected, setSelected] = useState(selectedOptions);
    const [updateAdminUserCall] = useMutation(UPDATE_ADMIN_USER);

    const setAdmin = (newSelect) => {
        for(let i=0; i < newSelect.length; i++) {
            if(!selected.includes(newSelect[i])) {
                updateAdminUserCall({ variables: { 
                    username: newSelect[i],
                    isAdmin: true
                }});
            }
        }
        for(let i=0; i < selected.length; i++) {
            if(!newSelect.includes(selected[i])) {
                updateAdminUserCall({ variables: { 
                    username: selected[i],
                    isAdmin: false
                }});
            }
        }
        setSelected(newSelect);
    }

    return (
        <DualListBox options={options} selected={selected} onChange={setAdmin}/>
    );
}

class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentUser: this.props.currentUser
        };
    }


    render() {
        return (
            <Query query={GET_USERS}>
            {
                ({ loading, error, data }) => {
                    if (loading) return <div>Loading ...</div> 
                    if (error) return <div>Error</div>

                    let options = [];
                    let selectedOptions = [];

                    const users = data[getUsersQueryName]
                    for(let i=0; i < users.length; i++) {
                        options.push({value: users[i].username, label: users[i].username + " (" + users[i].emails[0].address + ")"});

                        if(users[i].admin) {
                            selectedOptions.push(users[i].username)
                        }
                    }

                    return (
                        <div className="admin-container">
                            <h3>Administrator</h3>
                            <div className="admin-description">
                                Manage administrator settings.
                            </div>
                            <div className="modify-admins-header">
                                <h5>Modify Current Admins</h5>
                            </div>
                            <div className="dual-input-container">
                                <DualInputBox options={options} selectedOptions={selectedOptions}/>
                            </div>
                        </div>
                    )
                }
            }
            </Query>
        )  
    }
}

export default withRouter(AdminPage);