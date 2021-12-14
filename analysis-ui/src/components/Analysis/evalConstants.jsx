import {RESOURCES_URL} from '../../services/config';

const Eval2 = {
    moviesBucket: RESOURCES_URL + "/eval-2-inphys-videos/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-2/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-2-top-down/",
    movieExtension: ".mp4",
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
    moviesBucket: RESOURCES_URL + "/eval-3/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-3/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-3/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-3-scenes/",
    sceneExtension: "_debug.json",
}

const Eval3_5 = {
    moviesBucket: RESOURCES_URL + "/eval-3.5/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-3.5/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-3.5/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-3.5/", 
    sceneExtension: "_debug.json",
}

const Eval3_75 = {
    moviesBucket: RESOURCES_URL + "/eval-3.75/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-3.75/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-3.75/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-3.75/",
    sceneExtension: "_debug.json",
}

const Eval4 = {
    moviesBucket: RESOURCES_URL + "/eval-resources-4/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-resources-4/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-resources-4/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-4/",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt"
}

const Eval5 = {
    moviesBucket: RESOURCES_URL + "/eval-resources-5/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-resources-5/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-resources-5/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-5/",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt"
}

const Eval6 = {
    moviesBucket: RESOURCES_URL + "/eval-resources-6/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-resources-6/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-resources-6/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-6/",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt"
}

const Eval7 = {
    moviesBucket: RESOURCES_URL + "/eval-resources-7/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-resources-7/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-resources-7/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-7/",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt"
}

const Eval8 = {
    moviesBucket: RESOURCES_URL + "/eval-resources-8/",
    interactiveMoviesBucket: RESOURCES_URL + "/eval-resources-8/",
    topDownMoviesBucket: RESOURCES_URL + "/eval-resources-8/",
    movieExtension: ".mp4",
    sceneBucket: RESOURCES_URL + "/eval-scenes-8/",
    sceneExtension: "_debug.json",
    logExtension: "_log.txt"
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