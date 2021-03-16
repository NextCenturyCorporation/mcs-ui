import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import EvalStatusConfigureModal from './evalStatusConfigure';

const EvaluationStatusQuery = "getEvaluationStatus";

const get_evaluation_status = gql`
    query getEvaluationStatus($eval: String!){
        getEvaluationStatus(eval: $eval)
    }`;

function ConfigureEval ({statusObj, testTypes, performers, metadatas, updateStatusObjHandler, evalName}) {

    const [modalShow, setModalShow] = React.useState(false);

    return (
        <>
            <a href="#configureEval" onClick={() => setModalShow(true)} className="icon-link">
                <span className="icon-link-text">Configure</span>
            </a>

            <EvalStatusConfigureModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                statusObj={statusObj[0].evalStatusParams}
                testTypes={testTypes}
                performers={performers}
                metadatas={metadatas}
                updateStatusObjHandler={updateStatusObjHandler}
                evalName={evalName}
            />
        </>
    );
    
}

class EvalStatusTable extends React.Component {

    constructor(props) {
        super();
        props.evaluationOptions.sort((a, b) => (a.label < b.label) ? 1 : -1)

        this.state = {
            currentEval: props.evaluationOptions[0],
        }

        this.selectEvaluation = this.selectEvaluation.bind(this);
        this.updateTableRefresh = this.updateTableRefresh.bind(this);
    }

    selectEvaluation(target){
        this.setState({
            currentEval: target
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
                                            <ConfigureEval statusObj={evalStatus.statusObj} testTypes={testTypes} performers={evalStatus.performers}
                                                metadatas={evalStatus.metadatas} updateStatusObjHandler={this.updateTableRefresh} evalName={this.state.currentEval.value}/>
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