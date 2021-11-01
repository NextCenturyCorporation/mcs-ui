import React, {useState} from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import _ from "lodash";
import { convertValueToString } from './displayTextUtils';

function ClassificationByStepTable ({evaluation, currentSceneHistItem}) {

    const [showInternalState, toggleShowInternalState] = useState(false);

    const showInternalStatePreview = (stepObj) => {
        if(!_.isEmpty(stepObj.internal_state)) {
            // return the first 20 characters for the preview version for now...
            return JSON.stringify(stepObj.internal_state).substring(0, 20) + '...';
        } else {
            return "";
        }
    }

    const convertXYArrayToString = (arrayToConvert) => {
        let newStr = "";
        for(let i=0; i < arrayToConvert.length; i++) {
            newStr = newStr + '(' + convertValueToString(arrayToConvert[i]) + ')';

            if(i < arrayToConvert.length -1) {
                newStr = newStr + ", ";
            }
        }

        return newStr;
    }

    return (
        <div className="classification-by-step">
            <Accordion defaultActiveKey="1">
                <Card>
                    <Accordion.Toggle as={Card.Header} className="pointer-on-hover" eventKey="0">
                        <div>
                            <div>
                                <h3>Selected Scene Classification by Step</h3>
                            </div>
                            <div>
                                <h6>(Click Here to Expand/Collapse)</h6>
                            </div>
                        </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className="score-table-div">
                                <table className="score-table">
                                    <thead>
                                        <tr>
                                            <th>Step Number</th>
                                            <th>Action</th>
                                            <th>Classification</th>
                                            <th>Confidence</th>
                                            <th>Violations ((x,y) list)</th>
                                            {evaluation !== "Evaluation 3 Results" && evaluation !== "Evaluation 3.5 Results" &&
                                                <th>Internal State
                                                    <br/>
                                                    <span className={showInternalState ? "internal-state-toggle" : "display-none"} onClick={() => toggleShowInternalState(false)}>(Click to Collapse)</span>
                                                    <span className={showInternalState ? "display-none" : "internal-state-toggle"} onClick={() => toggleShowInternalState(true)}>(Click to Expand)</span>
                                                </th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentSceneHistItem !== undefined && currentSceneHistItem !== null
                                            && currentSceneHistItem.steps.map((stepObj, key) => 
                                            <tr key={'performer_classification_by_step_row_' + key}>
                                                <td>{stepObj.stepNumber}</td>
                                                <td>{stepObj.action}</td>
                                                <td>{stepObj.classification}</td>
                                                <td>{stepObj.confidence}</td>
                                                <td>
                                                    {stepObj.action !== 'EndHabituation' && stepObj.violations_xy_list !== undefined
                                                    && stepObj.violations_xy_list !== null &&
                                                            convertXYArrayToString(stepObj.violations_xy_list)                                                                     
                                                    }
                                                </td>
                                                {evaluation !== "Evaluation 3 Results" && evaluation !== "Evaluation 3.5 Results" &&
                                                    <td className="internal-state-cell">
                                                        <span className={showInternalState ? "" : "display-none"}>
                                                            {JSON.stringify(stepObj.internal_state)}
                                                        </span>
                                                        <span className={showInternalState ? "display-none" : ""}>
                                                            {showInternalStatePreview(stepObj)}
                                                        </span>
                                                    </td>
                                                }
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>                            
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    );
}

export default ClassificationByStepTable;