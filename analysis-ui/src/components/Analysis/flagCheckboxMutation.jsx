import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';

const mcs_history = gql`
    query getEval2History($catTypePair: String!, $testNum: Int!){
        getEval2History(catTypePair: $catTypePair, testNum: $testNum) {
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
            cat_type_pair
        }
    }`;

const flagRemoveMutation = gql`
    mutation updateSceneHistoryRemoveFlag($catTypePair: String!, $testNum: Int!, $flagRemove: Boolean!) {
        updateSceneHistoryRemoveFlag(catTypePair: $catTypePair, testNum: $testNum, flagRemove: $flagRemove) {
            total
        }
    }
`;

const flagInterestMutation = gql`
    mutation updateSceneHistoryInterestFlag($catTypePair: String!, $testNum: Int!, $flagInterest: Boolean!) {
        updateSceneHistoryInterestFlag(catTypePair: $catTypePair, testNum: $testNum, flagInterest: $flagInterest) {
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
                    catTypePair: state.catTypePair,
                    testNum: parseInt(state.testNum),
                    flagRemove: state.flagRemove
            }, refetchQueries: { 
                query: mcs_history, 
                variables:{"catTypePair": currentState.catTypePair, "testNum": currentState.testNum}
            }
        });
    }

    const mutateInterestFlagUpdate = () => {
        updateInterestFlags({
                variables: {
                    catTypePair: state.catTypePair,
                    testNum: parseInt(state.testNum),
                    flagInterest: state.flagInterest  
            }, refetchQueries: { 
                query: mcs_history, 
                variables:{"catTypePair": currentState.catTypePair, "testNum": currentState.testNum}
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