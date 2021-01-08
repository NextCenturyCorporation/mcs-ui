import React from 'react';
import queryString from 'query-string';
import Results from './results';
import HomePage from './home';
import Scenes from './scenes';
import ScenesEval3 from './scenesEval3';
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

const AnalysisUI = ({newState, updateHandler}) => {
    let params = queryString.parse(window.location.search);


    if(params.eval) {
        newState.eval = params.eval;

        if(params.test_type) {
            newState.test_type = params.test_type;
        } else if(params.category_type) {
            newState.category_type = params.category_type;
        }
    
        if(params.scene_num) {
            newState.scene_num = params.scene_num;
        }
    }

    if(newState.currentUser == null) {
        history.push('/login');
    }

    let hasEval =  (newState.eval !== undefined && newState.eval !== null)
    let isEval3 = hasEval && newState.eval.includes("3");
    let hasCatType = (newState.category_type !== undefined && newState.category_type !== null)
    let hasTestType = (newState.test_type !== undefined && newState.test_type !== null)
    let hasSceneNum = (newState.scene_num !== undefined && newState.scene_num !== null)

    return <div>
        <div className="layout">

            <EvalHeader state={newState} updateHandler={updateHandler}/>

            <div className="layout-board">
                { (newState.perf !== undefined && newState.perf !== null) && <Results value={newState}/>}
                { (!isEval3) && hasTestType && hasSceneNum && <Scenes value={newState}/> }
                { isEval3 && hasCatType && hasSceneNum && <ScenesEval3 value={newState}/> }
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
        if(newState.eval) {
            let analysisString = "/analysis?eval=" + newState.eval;

            if(newState.test_type) {
                analysisString += "&test_type=" + newState.test_type;
            } else if(newState.category_type) {
                analysisString += "&category_type=" + newState.category_type;
            } 

            if(newState.scene_num) {
                analysisString += "&scene_num=" + newState.scene_num;
            } 

            history.push(analysisString);
        } else {
            history.push("/");
        }
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
        this.state.category_type = null;
        this.state.test_type = null;
        this.state.scene_num = null;
    
        this.logout = this.logout.bind(this);
        this.userLoginHandler = this.userLoginHandler.bind(this);
        this.updateHandler = this.updateHandler.bind(this);
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

    doesStateHaveEval() {
        return this.state['eval'] !== null && this.state['eval'] !== undefined;
    }

    doesStateHaveTestType() {
        return this.state['test_type'] !== null && this.state['test_type'] !== undefined;
    }

    doesStateHaveCategoryType() {
        return this.state['category_type'] !== null && this.state['category_type'] !== undefined;
    }

    doesStateHaveSceneNum() {
        return this.state['scene_num'] !== null && this.state['scene_num'] !== undefined;
    }

    updateHandler(key, item) {
        if(key === 'test_type' && this.doesStateHaveCategoryType()) {
            this.setState({ [key]: item, category_type: null, scene_num: null});
        } else if(key === 'category_type' && this.doesStateHaveTestType()) {
            this.setState({ [key]: item, test_type: null, scene_num: null});
        } else {
            this.setState({ [key]: item });
        }
    }

    getAnalysisUIPath() {
        let analysisPath = '/analysis';

        if(this.doesStateHaveEval()) {
            analysisPath += "?eval=" + this.state['eval'];

            if(this.doesStateHaveTestType()) {
                analysisPath += "&test_type=" + this.state['test_type'];
            } else if(this.doesStateHaveCategoryType()) {
                analysisPath += "&category_type=" + this.state['category_type'];
            }

            if(this.doesStateHaveSceneNum()) {
                analysisPath += "&scene_num=" + this.state['scene_num'] ;
            }
        }

        return analysisPath;
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
                                    <Link className="nav-link" to={this.getAnalysisUIPath()}>Analysis</Link>
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
                        <Route path="/analysis">
                            <AnalysisUI newState={this.state} updateHandler={this.updateHandler}/>
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