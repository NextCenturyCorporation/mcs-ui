const Eval2 = {
    moviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-inphys-videos/",
    interactiveMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2/",
    topDownMoviesBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-top-down/",
    movieExtension: ".mp4",
    sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-2-scenes/",
    sceneExtension: "-debug.json",

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
    // ??? sceneBucket: "https://evaluation-images.s3.amazonaws.com/eval-3/",
    sceneExtension: "_debug.json",

    performerPrefixMapping: {
        "IBM-MIT-Harvard-Stanford": "mit_",
        "OPICS (OSU, UU, NYU)": "opics_",
        "MESS-UCBerkeley": "mess_",
    }
}

export const EvalConstants = {
    "Eval2": Eval2, 
    "Eval3": Eval3
}