import React, {useState, useEffect} from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import EvalStatusConfigureModal from './evalStatusConfigure';
import CreateCSVModal from './createCSVModal';

const CSV_URL_PREFIX = "https://resources.machinecommonsense.com/csv-db-files/Evaluation_";
const CSV_URL_SCENE_SUFFIX = "_Scenes.csv";
const CSV_URL_RESULTS_SUFFIX = "_Results.csv";
const EvaluationStatusQuery = "getEvaluationStatus";

const get_evaluation_status = gql`
    query getEvaluationStatus($eval: String!){
        getEvaluationStatus(eval: $eval)
    }`;

function ConfigureEval ({statusObj, testTypes, performers, metadatas, updateStatusObjHandler, evalName}) {

    const [modalShow, setModalShow] = React.useState(false);

    let statusObjModal = {};
    if(statusObj[0] !== undefined) {
        statusObjModal = statusObj[0].evalStatusParams
    } else {
        statusObjModal = {
            testTypes: "",
            performers: "",
            metadatas: ""
        }
    }

    return (
        <>
            <a href="#configureEval" onClick={() => setModalShow(true)} className="icon-link">
                <button type="button" className="btn btn-secondary">Configure</button>
            </a>

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

function CSVDownloadLink({url, linkText}) {
    const [linkActive, updateLinkActive] = useState();
    useEffect(() => {
        const getUrl = async () => {
            const linkCheck = await fetch(url);
            updateLinkActive(linkCheck.ok);
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
            evalNumber: props.evaluationOptions[0].value.replace(/[^0-9.]/g,'')
        }

        this.selectEvaluation = this.selectEvaluation.bind(this);
        this.updateTableRefresh = this.updateTableRefresh.bind(this);
    }

    selectEvaluation(target){
        this.setState({
            currentEval: target,
            evalNumber: target.value.replace(/[^0-9.]/g,'')
        });
    }

    updateTableRefresh() {
        this.refetch();
    }

    findTypeCount(type, sceneStats) {
        for(let i=0; i < sceneStats.length; i++) {
            if(type === sceneStats[i]._id.sceneType) {
                return sceneStats[i].count;
            }
        }
    }
    
    reloadTable() {
        this.updateTableRefresh();
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
            if(type === evalStatus.evalStats[i]._id.test_type && performer === evalStatus.evalStats[i]._id.performer &&
                metadata === evalStatus.evalStats[i]._id.metadata) {
                    historyIngested = evalStatus.evalStats[i].count;
            }
        }

        const percentComplete = (historyIngested / typeTotal * 100).toFixed(2);

        return historyIngested + " / " + typeTotal + "(" + percentComplete + "%)";
    }

    render() {
        const setRefetch = refetch => {this.refetch = refetch};
        if(this.state.counter !== this.props.counter) {
            this.reloadTable();
        }
        
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
                    <Query query={get_evaluation_status} variables={{"eval": this.state.currentEval.value}} fetchPolicy={'no-cache'}>
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

                            return (
                                <>
                                    <div className="eval-stats-container">
                                        <div className="eval-stats-configure">
                                            <CSVDownloadLink linkText={"Download Scenes"} url={CSV_URL_PREFIX + this.state.evalNumber + CSV_URL_SCENE_SUFFIX}/>
                                            <CSVDownloadLink linkText={"Download Results"} url={CSV_URL_PREFIX + this.state.evalNumber + CSV_URL_RESULTS_SUFFIX}/>
                                            <div className="eval-button-holder">
                                                {this.state.currentUser.admin === true &&
                                                    <CreateCSV/>
                                                }
                                                <ConfigureEval statusObj={evalStatus.statusObj} testTypes={testTypes} performers={evalStatus.performers}
                                                    metadatas={evalStatus.metadatas} updateStatusObjHandler={this.updateTableRefresh} evalName={this.state.currentEval.value}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="eval-stats-body">
                                        {evalStatus.statusObj.length > 0 && 
                                            <div className="charts-container eval-charts-container">
                                                {evalStatus.statusObj[0].evalStatusParams.testTypes.map((sceneType, sceneTypeKey) => (
                                                    <div className='chart-home-container' key={"table_holder_" + sceneTypeKey}>
                                                        <div className='chart-header'>
                                                            <div className='chart-header-label count-header-size'>
                                                                <h5>{sceneType.label}</h5> 
                                                                Count({this.findTypeCount(sceneType.label, evalStatus.sceneStats)})
                                                            </div>
                                                        </div>
                                                        <div className="eval-chart-table">
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <th></th>
                                                                        {evalStatus.statusObj[0].evalStatusParams.metadatas.map((metadata, metaKey) => (
                                                                            <th key={"header_" + sceneTypeKey + metaKey}>
                                                                                {metadata.label}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                    {evalStatus.statusObj[0].evalStatusParams.performers.map((performer, performerKey) => (
                                                                        <tr key={"performer_row_" + sceneTypeKey + performerKey}>
                                                                            <td>{performer.label}</td>
                                                                            {evalStatus.statusObj[0].evalStatusParams.metadatas.map((metadata, metaKey) => (
                                                                                <td key={"performer_row_" + sceneTypeKey + performerKey + metaKey}>
                                                                                    {this.calculateCellValue(evalStatus, sceneType.label, performer.label, metadata.label)}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
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