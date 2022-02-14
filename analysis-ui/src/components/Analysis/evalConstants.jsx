import {RESOURCES_URL} from '../../services/config';

const baseEvalConstant = {
    movieExtension: ".mp4",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt" // note that there are only logs for Eval 4+
}

const Eval2 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-2-inphys-videos/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-2/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-2-top-down/",
    sceneBucket: RESOURCES_URL + "/eval-2-scenes/",
    sceneExtension: "-debug.json",

    // note that this performerPrefixMapping is only used on the Eval 2 Results Page
    performerPrefixMapping: {
        "IBM-MIT-Harvard-Stanford": "mitibm_",
        "OPICS (OSU, UU, NYU)": "opics_",
        "MESS-UCBerkeley": "mess_",
        "IBM-MIT-Harvard-Stanford-2": "mitibm2_"
    }
};

const Eval3 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-3/",
    sceneBucket: RESOURCES_URL + "/eval-3-scenes/",
}

const Eval3_5 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-3.5/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-3.5/", 
}

const Eval3_75 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-3.75/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-3.75/",
}

const Eval4 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-resources-4/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-4/",
}

const Eval5 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-resources-5/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-5/",
}

const Eval6 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-resources-6/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-6/",
}

const Eval7 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-resources-7/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-7/",
}

const Eval8 = {
    ...baseEvalConstant,
    moviesBucket: RESOURCES_URL + "/eval-resources-8/",
    sceneBucket: RESOURCES_URL + "/eval-scenes-8/",
}

export const EvalConstants = {
    "eval_2_results": Eval2, 
    "eval_3_results": Eval3,
    "eval_3_5_results": Eval3_5,
    "eval_3_75_results": Eval3_75,
    "eval_4_results": Eval4,
    "eval_5_results": Eval5,
    "eval_6_results": Eval6,
    "eval_7_results": Eval7,
    "eval_8_results": Eval8     
}