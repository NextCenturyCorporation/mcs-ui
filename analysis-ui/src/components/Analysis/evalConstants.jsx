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
    "Evaluation 2 Results": Eval2, 
    "Evaluation 3 Results": Eval3,
    "Evaluation 3.5 Results": Eval3_5,
    "Evaluation 3.75 Results": Eval3_75,
    "Evaluation 4 Results": Eval4,
    "Evaluation 5 Results": Eval5,
    "Evaluation 6 Results": Eval6,
    "Evaluation 7 Results": Eval7,
    "Evaluation 8 Results": Eval8     
}