const Eval2 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-inphys-videos/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-top-down/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-scenes/",
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
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-3-scenes/",
    sceneExtension: "_debug.json",
}

const Eval3_5 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3.5/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3.5/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-3.5/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-scenes-3.5/", 
    sceneExtension: "_debug.json",
}

const Eval4 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-4/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-4/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-4/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-4-scenes/",
    sceneExtension: "_debug.json",
}

const Eval5 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-5/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-5/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-5/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-5-scenes/",
    sceneExtension: "_debug.json",
}

const Eval6 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-6/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-6/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-6/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-6-scenes/",
    sceneExtension: "_debug.json",
}

const Eval7 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-7/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-7/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-7/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-7-scenes/",
    sceneExtension: "_debug.json",
}

const Eval8 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-8/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-8/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-8/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-8-scenes/",
    sceneExtension: "_debug.json",
}

export const EvalConstants = {
    "Evaluation 2 Results": Eval2, 
    "Evaluation 3 Results": Eval3,
    "Evaluation 3.5 Results": Eval3_5,
    "Evaluation 4 Results": Eval4,
    "Evaluation 5 Results": Eval5,
    "Evaluation 6 Results": Eval6,
    "Evaluation 7 Results": Eval7,
    "Evaluation 8 Results": Eval8     
}