import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';

const mcs_history = gql`
    query getEval2History($testType: String!, $testNum: Int!, $performer: String!){
        getEval2History(testType: $testType, testNum: $testNum, performer: $performer) {
            eval
            performer
            name
            test_type
            test_num
            scene_num
            score
            steps
            flags
            step_counter
            category
            category_type
            category_pair
        }
    }`;

const flagRemoveMutation = gql`
    mutation updateSceneHistoryRemoveFlag($testType: String!, $testNum: Int!, $flagRemove: Boolean!) {
        updateSceneHistoryRemoveFlag(testType: $testType, testNum: $testNum, flagRemove: $flagRemove) {
            total
        }
    }
`;

const flagInterestMutation = gql`
    mutation updateSceneHistoryInterestFlag($testType: String!, $testNum: Int!, $flagInterest: Boolean!) {
        updateSceneHistoryInterestFlag(testType: $testType, testNum: $testNum, flagInterest: $flagInterest) {
            total
        }
    }
`;

const FlagCheckboxMutation = ({state, currentState}) => {
    const [updateRemoveFlags] = useMutation(flagRemoveMutation);
    const [updateInterestFlags] = useMutation(flagInterestMutation);

    const updateRemoveFlag = (evt) => {
        state.flagRemove = state.flagRemove  ? false : true;
        mutateRemoveFlagUpdate();
    }

    const updateInterestFlag = (evt) => {
        state.flagInterest = state.flagInterest ? false : true;
        mutateInterestFlagUpdate();
    }

    const mutateRemoveFlagUpdate = () => {
        updateRemoveFlags({
                variables: {
                    testType: state.testType,
                    testNum: parseInt(state.testNum),
                    flagRemove: state.flagRemove
            }, refetchQueries: { 
                query: mcs_history, 
                variables:{"testType": currentState.testType, "testNum": currentState.testNum}
            }
        });
    }

    const mutateInterestFlagUpdate = () => {
        updateInterestFlags({
                variables: {
                    testType: state.testType,
                    testNum: parseInt(state.testNum),
                    flagInterest: state.flagInterest  
            }, refetchQueries: { 
                query: mcs_history, 
                variables:{"testType": currentState.testType, "testNum": currentState.testNum}
            }
        });
    }

    return (
        <div className="checkbox-holder">
              <div className="form-check">
                  <label className="form-check-label">
                      <input type="checkbox" id="flagCheckRemove" className="form-check-input" name="Flag for removal" checked={state.flagRemove} onChange={updateRemoveFlag}/>
                      Flag for removal
                  </label>
              </div>
              <div className="form-check">
                  <label className="form-check-label">
                      <input type="checkbox" id="flagCheckInterest" className="form-check-input" mame="Flag for interest" checked={state.flagInterest} onChange={updateInterestFlag}/>
                      Flag for interest
                  </label>
              </div>
        </div>
    )
}

export default FlagCheckboxMutation;