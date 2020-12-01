import React from 'react';
import {withRouter} from 'react-router-dom';
//import { accountsPassword } from '../../services/accountsService';


class MyAccountPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: "",
        };

        //accountsPassword
    }

    render() {
        return (
            <div className="">
                My Account page
            </div>
        );
    }
}

export default withRouter(MyAccountPage);