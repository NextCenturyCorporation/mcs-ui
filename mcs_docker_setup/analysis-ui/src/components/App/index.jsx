import React from 'react';
import queryString from 'query-string';
import Results from './results';
import HomePage from './home';
import Scenes from './scenes';
import EvalHeader from './header';
import QueryPage from './queryPage';
import CommentsComponent from './comments';
import {Router, Switch, Route, Link} from 'react-router-dom';
import LoginApp from './login';
import ResetPassPage from './resetPassword';
import MyAccountPage from './myAccount';
import {accountsClient, accountsGraphQL} from '../../services/accountsService';
import {createBrowserHistory} from 'history';
import NavDropdown from 'react-bootstrap/NavDropdown';

// CSS and Image Stuff 
import '../../css/app.css';
import 'rc-slider/assets/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'jquery/dist/jquery.min.js';
import 'material-design-icons/iconfont/material-icons.css';
import 'react-dropdown/style.css';

import brandImage from '../../img/mcs_logo.png';
import userImage from '../../img/account_icon.png';

const history = createBrowserHistory();

const AnalysisUI = ({newState}) => {
    if(newState.currentUser == null) {
        history.push('/login');
    }

    return <div>
        <div className="layout">

            <EvalHeader state={newState}/>

            <div className="layout-board">
                { (newState.perf !== undefined && newState.perf !== null) && <Results value={newState}/>}
                { (newState.test_type !== undefined && newState.test_type !== null) && <Scenes value={newState}/> }
                { newState.showComments &&  <CommentsComponent state={newState}/> }
            </div>
        </div>
    </div>;
}

function QueryBuilder({newState}) {
    if(newState.currentUser == null) {
        history.push('/login');
    }

    return <QueryPage currentUser={newState.currentUser}/>
}

function Home({newState}) {
    if(newState.currentUser == null) {
        history.push('/login');
    }

    return <HomePage/>;
}

function Login({newState, userLoginHandler}) {
    if(newState.currentUser !== null) {
        history.push("/");
    }

    return <LoginApp userLoginHandler={userLoginHandler}/>;
}

function MyAccount({newState, userLoginHandler}) {
    if(newState.currentUser == null) {
        history.push("/login");
    }

    return <MyAccountPage currentUser={newState.currentUser} updateUserHandler={userLoginHandler}/>
}

export class App extends React.Component {

    // Assume that we are called with a URL like:
    // http://localhost:3000/app/?perf=TA1_group_test&subm=submission_0&block=O1&test=0001

    constructor(props) {
        super(props);

        this.state = queryString.parse(window.location.search);
        this.state.currentUser = null;
        this.state.showComments = (process.env.REACT_APP_COMMENTS_ON.toLowerCase() === 'true' || process.env.REACT_APP_COMMENTS_ON === '1');
    
        this.logout = this.logout.bind(this);
        this.userLoginHandler = this.userLoginHandler.bind(this);
    }

    async componentDidMount() {
        //refresh the session to get a new accessToken if expired
        const tokens = await accountsClient.refreshSession();

        if(window.location.href.indexOf("reset-password") > -1) {
            return;
        }

        if (!tokens) {
          history.push('/login');
          return;
        }

        const user = await accountsGraphQL.getUser(
          tokens ? tokens.accessToken : ''
        );

        this.setState({ currentUser: user});
    }

    async logout() {
        await accountsClient.logout();
        history.push('/login');
        this.setState({currentUser: null});
    }

    userLoginHandler(userObject) {
        this.setState({ currentUser: userObject });
    }

    render() {
        const {currentUser} = this.state;
        return (
            <Router history={history}>
                <div className="mcs-app">
                    {currentUser && 
                        <nav className="navbar navbar-expand-lg navbar-light bg-light mcs-navbar">
                            <a className="navbar-brand" href="/">
                                <img className="nav-brand-mcs" src={brandImage} alt=""/>
                            </a>
                            <ul className="navbar-nav mr-auto">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/query">Query Builder</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/analysis">Analysis</Link>
                                </li>
                            </ul>
                            <ul className="navbar-nav ml-auto">
                                <li className="login-user">
                                    <img className="nav-login-icon" src={userImage} alt=""/>
                                    <NavDropdown title={currentUser.emails[0].address} id="basic-nav-dropdown">
                                        <Link className="dropdown-item" to="/myaccount">My Account</Link>
                                        <Link className="dropdown-item" to={{}} onClick={this.logout}>Logout</Link>
                                    </NavDropdown>
                                </li>
                            </ul>
                        </nav>
                    }

                    <Switch>
                        <Route exact path="/">
                            <Home newState={this.state}/>
                        </Route>
                        <Route exact path="/query">
                            <QueryBuilder newState={this.state}/>
                        </Route>
                        <Route exact path="/analysis">
                            <AnalysisUI newState={this.state}/>
                        </Route>
                        <Route path="/login">
                            <Login newState={this.state} userLoginHandler={this.userLoginHandler}/>
                        </Route>
                        <Route path="/reset-password/:token" component={ResetPassPage}/>
                        <Route path="/myaccount">
                            <MyAccount newState={this.state} userLoginHandler={this.userLoginHandler}/>
                        </Route>
                    </Switch>
                </div>
            </Router>
        );
    }
}