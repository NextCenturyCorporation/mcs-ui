import React, {useState, useEffect} from 'react';
import { Query, useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import EvalStatusConfigureModal from './evalStatusConfigure';
import CreateCSVModal from './createCSVModal';
import {RESOURCES_URL} from '../../services/config';

const CSV_URL_PREFIX = RESOURCES_URL + "/csv-db-files/Evaluation_";
const CSV_URL_SCENE_SUFFIX = "_Scenes.csv";
const CSV_URL_RESULTS_SUFFIX = "_Results.csv";
const EvaluationStatusQuery = "getEvaluationStatus";
const getLinkStatusQueryName = "getLinkStatus";

const get_evaluation_status = gql`
    query getEvaluationStatus($eval: String!, $evalName: String!){
        getEvaluationStatus(eval: $eval, evalName: $evalName)
    }`;

const get_link_status = gql`
    query getLinkStatus($url: String!){
        getLinkStatus(url: $url)
    }`;

const completed_evals_mutation = gql`
    mutation updateCompletedEvals($completedEvals: [String]!){
        updateCompletedEvals(completedEvals: $completedEvals)
    }`;

const get_completed_evals = gql`
    query getCompletedEvals{
        getCompletedEvals
    }`;

function EvalStatusSetter ({currentEval, setCompletedEvals}) {

    const [updateCompletedEvalsCall] = useMutation(completed_evals_mutation);
    const {loading, error, data, refetch} = useQuery(get_completed_evals);

    const updateCompletedEvals = async () => {
        let completedEvals = data['getCompletedEvals']['completedEvals'];
        const index = completedEvals.indexOf(currentEval);
        if (index === -1)
            completedEvals.push(currentEval);
        else
            completedEvals.splice(index, 1);
        await updateCompletedEvalsCall({ variables: {
            completedEvals: completedEvals
        }});
        setCompletedEvals(completedEvals);
        refetch();
    };

    const checkIfComplete = () => {
        return data['getCompletedEvals']['completedEvals'].includes(currentEval.toString());
    }

    useEffect(() => {
        const setCompleted = async () => {
            refetch();
            if(data !== undefined && data['getCompletedEvals']['completedEvals'] !== undefined) {
                setCompletedEvals(data['getCompletedEvals']['completedEvals']);
            }
        }
        setCompleted();
    }, [data]);

    if (loading) return <p>Loading</p>;
    if (error) return <p>Error</p>;
    return (
        <div>
            <input type="checkbox" className='eval-complete-checkbox' id="eval-complete" name="eval-complete"
                onChange={() => updateCompletedEvals()} checked={checkIfComplete()}/>
            <label htmlFor="eval-complete" className='eval-complete-text'>Eval Complete</label>
        </div>
    )
}
    
function ConfigureEval ({statusObj, testTypes, performers, metadatas, updateStatusObjHandler, evalName}) {

    const [modalShow, setModalShow] = React.useState(false);

    let statusObjModal = {};
    if(statusObj[0] !== undefined) {
        statusObjModal = statusObj[0].evalStatusParams;
    }

    return (
        <>
            <a href="#configureEval" onClick={() => setModalShow(true)} className="icon-link">
                <button type="button" className="btn btn-secondary">Configure</button>
            </a>

            {modalShow && 
                <EvalStatusConfigureModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    statusObj={statusObjModal}
                    testTypes={testTypes}
                    performers={performers}
                    metadatas={metadatas}
                    updateStatusObjHandler={updateStatusObjHandler}
                    evalName={evalName}
                />
            }
        </>
    );
    
}

function CreateCSV() {
    const [csvModalShow, setCsvModalShow] = React.useState(false);

    return(
        <>
            <a href="#createCSVModal" onClick={() => setCsvModalShow(true)} className="icon-link create-csv-button">
                <button type="button" className="btn btn-secondary">Create CSV</button>
            </a>

            <CreateCSVModal
                show={csvModalShow}
                onHide={() => setCsvModalShow(false)}
            />
        </>
    );
}

function CSVDownloadLink({url, linkText, evalNumber}) {
    const {data, refetch} = useQuery(get_link_status, {variables: {url}, fetchPolicy: 'no-cache'});
    const [linkActive, updateLinkActive] = useState();

    useEffect(() => {
        const getUrl = async () => {
            refetch({variables: {url}});
            if(data !== undefined && data[getLinkStatusQueryName] !== undefined) {
                updateLinkActive(data[getLinkStatusQueryName]);
            }
        }
        getUrl();
    });

    return(
        <>
            {linkActive === true &&
                <a href={url}  className="icon-link download-csv-button">
                    <button type="button" className="btn btn-link">{linkText}</button>
                </a>
            }
        </>
    )
}

class EvalStatusTable extends React.Component {

    constructor(props) {
        super();
        props.evaluationOptions.sort((a, b) => (a.label < b.label) ? 1 : -1)

        this.state = {
            currentEval: props.evaluationOptions[0],
            counter: props.counter,
            currentUser: props.currentUser,
            evalNumber: props.evaluationOptions[0].label.replace(/[^0-9.]/g,''),
            completedEvals: []
        }

        this.selectEvaluation = this.selectEvaluation.bind(this);
        this.updateTableRefresh = this.updateTableRefresh.bind(this);
        this.setCompletedEvals = this.setCompletedEvals.bind(this);
    }

    selectEvaluation(target){
        this.setState({
            currentEval: target,
            evalNumber: target.label.replace(/[^0-9.]/g,'')
        });
    }

    updateTableRefresh() {
        this.props.continueUpdating();
        this.refetch();
        this.reloadTable();
    }

    findTypeCount(type, sceneStats) {
        for(let i=0; i < sceneStats.length; i++) {
            if(type === sceneStats[i]._id.sceneType) {
                return sceneStats[i].count;
            }
        }
    }
    
    reloadTable() {
        this.setState({
            counter: this.props.counter
        });
    }

    calculateCellValue(evalStatus, type, performer, metadata) {
        let typeTotal = 0;
        for(let i=0; i < evalStatus.sceneStats.length; i++) {
            if(type === evalStatus.sceneStats[i]._id.sceneType) {
                typeTotal = evalStatus.sceneStats[i].count;
            }
        }

        let historyIngested = 0;
        for(let i=0; i < evalStatus.evalStats.length; i++) {
            if(type === evalStatus.evalStats[i]._id.category_type && performer === evalStatus.evalStats[i]._id.performer &&
                metadata === evalStatus.evalStats[i]._id.metadata) {
                    historyIngested = evalStatus.evalStats[i].count;
            }
        }

        const percentComplete = (historyIngested / typeTotal * 100).toFixed(2);

        return historyIngested + " / " + typeTotal + "(" + percentComplete + "%)";
    }

    setCompletedEvals(completedEvals) {
        this.setState({
            completedEvals: completedEvals
        });
    }

    render() {
        const setRefetch = refetch => {this.refetch = refetch};
        if(!this.state.completedEvals.includes(this.state.evalNumber)) {
            this.props.continueUpdating();
            if(this.state.counter !== this.props.counter) {
                this.refetch();
                this.reloadTable();
            }
        }
        else
            this.props.stopUpdating();
        return (
            <div className="home-container">
                <div className="home-navigation-container">
                    <div className="evaluation-selector-container">
                        <div className="evaluation-selector-label">Evaluation:</div>
                        <div className="evaluation-selector-holder">
                            <Select
                                onChange={this.selectEvaluation}
                                options={this.props.evaluationOptions}
                                defaultValue={this.state.currentEval}
                            />
                        </div>
                    </div>
                </div>
                {this.state.currentEval !== '' &&
                    <Query query={get_evaluation_status} variables={{"eval": this.state.currentEval.value, "evalName": this.state.currentEval.label}} fetchPolicy={'no-cache'}>
                    {
                        ({ loading, error, data, refetch }) => {
                            setRefetch(refetch);
                            if (loading) return <div>No stats yet</div> 
                            if (error) return <div>Error: {error}</div>
                            
                            let evalStatus = data[EvaluationStatusQuery];

                            let testTypes = [];
                            for(let i=0; i < evalStatus.sceneStats.length; i++) {
                                testTypes.push({value: evalStatus.sceneStats[i]._id.sceneType, 
                                        label: evalStatus.sceneStats[i]._id.sceneType});
                            }

                            testTypes.sort((a, b) => (a.value > b.value) ? 1 : -1);

                            return (
                                <>
                                    <div className="eval-stats-container">
                                        <div className="eval-stats-configure">
                                            <CSVDownloadLink linkText={"Download Scenes"} url={CSV_URL_PREFIX + this.state.evalNumber + CSV_URL_SCENE_SUFFIX} evalNumber={this.state.evalNumber}/>
                                            <CSVDownloadLink linkText={"Download Results"} url={CSV_URL_PREFIX + this.state.evalNumber + CSV_URL_RESULTS_SUFFIX} evalNumber={this.state.evalNumber}/>
                                            <div className="eval-button-holder">
                                                {this.state.currentUser.admin === true &&
                                                        <>
                                                            <EvalStatusSetter currentEval={this.state.evalNumber} setCompletedEvals={this.setCompletedEvals}/>
                                                            <CreateCSV/>
                                                        </>
                                                }
                                                <ConfigureEval statusObj={evalStatus.statusObj} testTypes={testTypes} performers={evalStatus.performers}
                                                    metadatas={evalStatus.metadatas} updateStatusObjHandler={this.updateTableRefresh} evalName={this.state.currentEval.label}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="eval-stats-body">
                                        {evalStatus.statusObj.length > 0 && 
                                            <div className="charts-container eval-charts-container">
                                                {Object.entries(evalStatus.statusObj[0].evalStatusParams).map(([sceneTypeKey, sceneTypeKeyValue]) => (
                                                    <div className='chart-home-container' key={"table_holder_" + sceneTypeKey}>
                                                        <div className='chart-header'>
                                                            <div className='chart-header-label count-header-size'>
                                                                <h5>{sceneTypeKeyValue.label}</h5> 
                                                                Count({this.findTypeCount(sceneTypeKeyValue.label, evalStatus.sceneStats)})
                                                            </div>
                                                        </div>
                                                        {
                                                            sceneTypeKeyValue.metadata !== null && sceneTypeKeyValue.performers !== null &&
                                                            <div className="eval-chart-table">
                                                                <table>
                                                                    <tbody>
                                                                        <tr>
                                                                            <th></th>
                                                                            {sceneTypeKeyValue.metadata.map((metadata, metaKey) => (
                                                                                <th key={"header_" + sceneTypeKey + metaKey}>
                                                                                    {metadata.label}
                                                                                </th>
                                                                            ))}
                                                                        </tr>
                                                                        {sceneTypeKeyValue.performers.map((performer, performerKey) => (
                                                                            <tr key={"performer_row_" + sceneTypeKey + performerKey}>
                                                                                <td>{performer.label}</td>
                                                                                {sceneTypeKeyValue.metadata.map((metadata, metaKey) => (
                                                                                    <td key={"performer_row_" + sceneTypeKey + performerKey + metaKey}>
                                                                                        {this.calculateCellValue(evalStatus, sceneTypeKeyValue.label, performer.label, metadata.label)}
                                                                                    </td>
                                                                                ))}
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        }   
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                        {evalStatus.statusObj.length === 0 && 
                                            <div className="eval-not-configured">
                                                You have to configure this evaluation before the you can see the evaluation progress.
                                            </div>
                                        }
                                    </div>
                                </>
                            )
                        }
                    }
                </Query>
            }
        </div>
            
        );
    }
}

export default EvalStatusTable;