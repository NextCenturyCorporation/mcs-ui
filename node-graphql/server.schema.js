const { gql } = require('apollo-server');
const { mcsDB } = require('./server.mongo');
const mongoDb = require("mongodb");
const { GraphQLScalarType, Kind } = require("graphql");
const { statsByScore, statsByTestType } = require('./server.statsFunctions');
const { createComplexMongoQuery } = require('./server.mongoSyntax');
const {  historyFieldLabelMap, historyExcludeFields, sceneExcludeFields,  sceneFieldLabelMap, historyExcludeFieldsTable, 
    sceneExcludeFieldsTable, historyFieldLabelMapTable, sceneFieldLabelMapTable } = require('./server.fieldMappings');

let complexQueryProjectionObject = null;

const mcsTypeDefs = gql`
  scalar JSON

  scalar StringOrFloat

  type Source {
    block: String
    complexity: String
    ground_truth: Float
    num_objects: String
    occluder: String
    performer: String
    plausibility: Float
    scene: String
    submission: String
    test: String
    url_string: String
    voe_signal: JSON
    location_frame: Float
    location_x: Float
    location_y: Float
  }

  type Comment {
    id: String
    block: String
    performer: String
    submission: String
    test: String
    createdDate: String
    text: String
    userName: String
  }

  type NewComment {
    id: String
    test_type: String
    scene_num: String
    createdDate: String
    text: String
    userName: String
  }

  type History {
    eval: String
    performer: String
    name: String
    test_type: String
    scene_num: String
    scene_part_num: String
    score: JSON
    steps: JSON
    flags: JSON
    step_counter: Float
    category: String
    category_type: String
    category_pair: String
    scene_goal_id: String
    metadata: String
    filename: String
    fileTimestamp: String
  }

  type Scene {
    name: String
    ceilingMaterial: String
    floorMaterial: String
    wallMaterial: String
    wallColors: JSON
    performerStart: JSON
    objects: JSON
    goal: JSON
    answer: JSON
    eval: String
    test_type: String
    scene_num: String
    scene_part_num: String
    sequenceNumber: Int
    sceneNumber: Int
  }

  type SubmissionPerformer {
    _id: String
    submission: [String]
  }

  type updateObject {
    total: Float,
    updated: Float,
    failures: JSON
  }

  type homeStatsObject {
      stats: JSON,
      weightedStats: JSON
  }

  type savedQueryObj {
    user: JSON, 
    queryObj: JSON, 
    name: String, 
    description: String,
    createdDate: Float,
    _id: String
  }

  type dropDownObj {
      value: String
      label: String
  }

  type Query {
    msc_eval: [Source]
    getEvalHistory(testType: String, sceneNum: String) : [History]
    getEval3History(categoryType: String, sceneNum: Int) : [History]
    getEvalScene(testType: String, sceneNum: String) : [Scene]
    getEval3Scene(sceneName: String, sceneNum: Int) : [Scene]
    getEvalByTest(test: String) : [Source]
    getEvalByBlock(block: String) : [Source]
    getEvalBySubmission(submission: String) : [Source]
    getEvalByPerformer(performer: String) : [Source]
    getEvalAnalysis(test: String, block: String, submission: String, performer: String) : [Source]
    getComments(test: String, block: String, submission: String, performer: String) : [Comment]
    getCommentsByTestAndScene(testType: String, sceneNum: String) : [NewComment]
    getFieldAggregation(fieldName: String, eval: String) : [String]
    getSubmissionFieldAggregation: [SubmissionPerformer]
    getHistorySceneFieldAggregation(fieldName: String, eval: String) : [StringOrFloat]
    getSceneFieldAggregation(fieldName: String, eval: String) : [StringOrFloat]
    getAllHistoryFields: [dropDownObj]
    getAllSceneFields: [dropDownObj]
    getCollectionFields(collectionName: String): [dropDownObj]
    createComplexQuery(queryObject: JSON, projectionObject: JSON): JSON
    getHomeStats(eval: String): homeStatsObject
    getSavedQueries: [savedQueryObj]
    getScenesAndHistoryTypes: [dropDownObj]
  }

  type Mutation {
    saveComment(test: String, block: String, submission: String, performer: String, createdDate: String, text: String, userName: String) : Comment
    saveCommentByTestAndScene(testType: String, sceneNum: String, createdDate: String, text: String, userName: String) : NewComment
    updateSceneHistoryRemoveFlag(testType: String, sceneNum: String, flagRemove: Boolean) : updateObject
    updateSceneHistoryInterestFlag(testType: String, sceneNum: String, flagInterest: Boolean) : updateObject
    saveQuery(user: JSON, queryObj: JSON, name: String, description: String, createdDate: Float) : savedQueryObj
    updateQuery(queryObj: JSON, name: String, description: String, createdData: Float, _id: String) : savedQueryObj
    deleteQuery(_id: String) : savedQueryObj
  }
`;

const mcsResolvers = {
    Query: {
        msc_eval: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({})
                .toArray().then(result => {return result});
        },
        getEvalHistory: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection('mcs_history').find({'test_type': args["testType"], 'scene_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getEval3History: async(obj, args, context, infow) => {
            // Eval 3 - scene_part_num is actually the field we need
            // TODO: fix with reingest?
            return await mcsDB.db.collection('mcs_history').find({'category_type': args["categoryType"], 'scene_part_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getEvalScene: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection('mcs_scenes').find({'test_type': args["testType"], 'scene_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getEval3Scene: async(obj, args, context, infow) => {
            // Eval 3 - sequenceNumber is actually the field we need
            // TODO: rename scene_num to sequenceNum in eval3 URL references?
            return await mcsDB.db.collection('mcs_scenes').find({'name': {$regex: args["sceneName"]}, 'sequenceNumber': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getHistorySceneFieldAggregation: async(obj, args, context, infow) => {
            if(args["eval"]) {
                return await mcsDB.db.collection('mcs_history').distinct(args["fieldName"], {"eval": args["eval"]}).then(result => {return result});
            } else {
                return await mcsDB.db.collection('mcs_history').distinct(args["fieldName"]).then(result => {return result});
            }
        },
        getSceneFieldAggregation: async(obj, args, context, infow) => {
            if(args["eval"]) {
                return await mcsDB.db.collection('mcs_scenes').distinct(args["fieldName"], {"eval": args["eval"]}).then(result => {return result});
            } else {
                return await mcsDB.db.collection('mcs_scenes').distinct(args["fieldName"]).then(result => {return result});
            }
        },
        getEvalByTest: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({'test': args["test"]})
                .toArray().then(result => {return result});
        },
        getEvalByBlock: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({'block': args["block"]})
                .toArray().then(result => {return result});
        },
        getEvalBySubmission: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({'submission': args["submission"]})
                .toArray().then(result => {return result});
        },
        getEvalByPerformer: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({'performer': args["performer"]})
                .toArray().then(result => {return result});
        },
        getEvalAnalysis: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({'test': args["test"], 'block': args["block"], 
                'submission': args["submission"], 'performer': args["performer"]}).toArray().then(result => {return result});
        },
        getComments: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('comments').find({'test': args["test"], 'block': args["block"], 
                'submission': args["submission"], 'performer': args["performer"]}).toArray().then(result => {return result});
        },
        getCommentsByTestAndScene: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('comments').find({'test_type': args["testType"], 'scene_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getFieldAggregation: async(obj, args, context, infow) => {
            if(args["eval"]) {
                return await mcsDB.db.collection('msc_eval').distinct(args["fieldName"], {"eval": args["eval"]}).then(result => {return result});
            } else {
                return await mcsDB.db.collection('msc_eval').distinct(args["fieldName"]).then(result => {return result});
            }
        },
        getScenesAndHistoryTypes: async(obj, args, context, infow) => {
            let returnArray = [];
            const historyEvals = await mcsDB.db.collection('mcs_history').distinct("eval");
            for(let i=0; i < historyEvals.length; i++) {
                returnArray.push({label: historyEvals[i], value: "mcs_history." + historyEvals[i]});
            }

            const sceneEvals = await mcsDB.db.collection('mcs_scenes').distinct("eval");
            for(let i=0; i < sceneEvals.length; i++) {
                returnArray.push({label: sceneEvals[i], value: "mcs_scenes." + sceneEvals[i]});
            }
            
            return returnArray;
        },
        getSubmissionFieldAggregation: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').aggregate([{$group: {_id: '$performer', submission: {$addToSet: '$submission'}}}])
                .toArray().then(result => {return result});
        },
        getAllHistoryFields: async(obj, args, context, infow) => {
            let returnArray = [];
            const results =  await mcsDB.db.collection('mcs_history_keys').findOne();
            const historyKeys = results.keys;
            for(let i=0; i < historyKeys.length; i++) {
                if(!historyExcludeFields.includes(historyKeys[i])) {
                    if (historyKeys[i] in historyFieldLabelMap) {
                        returnArray.push({label: historyFieldLabelMap[historyKeys[i]], value: historyKeys[i]});
                    } else {
                        returnArray.push({label: historyKeys[i], value: historyKeys[i]});
                    }
                }
            }

            return returnArray;
        },
        getAllSceneFields: async(obj, args, context, infow) => {
            let returnArray = [];
            const results =  await mcsDB.db.collection('mcs_scenes_keys').findOne();
            const sceneKeys = results.keys;
            for(let i=0; i < sceneKeys.length; i++) {
                if(!sceneExcludeFields.includes(sceneKeys[i])) {
                    if (sceneKeys[i] in sceneFieldLabelMap) {
                        returnArray.push({label: sceneFieldLabelMap[sceneKeys[i]], value: sceneKeys[i]});
                    } else {
                        returnArray.push({label: sceneKeys[i], value: sceneKeys[i]});
                    }
                }
            }

            return returnArray;
        },
        getCollectionFields: async(obj, args, context, infow) => {
            let returnArray = [];
            const results =  await mcsDB.db.collection('collection_keys').findOne({"name": args["collectionName"]});
            const resultKeys = results.keys;

            for(let i=0; i < resultKeys.length; i++) {
                if(!sceneExcludeFields.includes(resultKeys[i]) && args["collectionName"].indexOf("Scene") > -1) {
                    if (resultKeys[i] in sceneFieldLabelMap) {
                        returnArray.push({label: sceneFieldLabelMap[resultKeys[i]], value: resultKeys[i]});
                    } else {
                        returnArray.push({label: resultKeys[i], value: resultKeys[i]});
                    }
                }
                if(!historyExcludeFields.includes(resultKeys[i]) && args["collectionName"].indexOf("Result") > -1 ) {
                    if (resultKeys[i] in historyFieldLabelMap) {
                        returnArray.push({label: historyFieldLabelMap[resultKeys[i]], value: resultKeys[i]});
                    } else {
                        returnArray.push({label: resultKeys[i], value: resultKeys[i]});
                    }
                }
            }

            return returnArray;
        },
        getSavedQueries: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').find()
                .toArray().then(result => {return result});
        },
        createComplexQuery: async(obj, args, context, infow)=> {
            mongoQueryObject = createComplexMongoQuery(args['queryObject']);

            if(args['projectionObject']) {
                complexQueryProjectionObject = args['projectionObject'];
            } else {
                complexQueryProjectionObject = null;
            }

            async function getComplexResults() {
                if(complexQueryProjectionObject === null ){
                    const historyKeys = await mcsDB.db.collection('mcs_history_keys').findOne();
                    const sceneKeys =  await mcsDB.db.collection('mcs_scenes_keys').findOne();

                    let projectionObj = {};

                    for(let j=0; j < sceneKeys["keys"].length; j++) {
                        if(!sceneExcludeFieldsTable.includes(sceneKeys["keys"][j])) {
                            projectionObj["scene." + sceneKeys["keys"][j]] = "$mcsScenes." + sceneKeys["keys"][j];
                        }
                    }

                    for(let i=0; i < historyKeys["keys"].length; i++) {
                        if(!historyExcludeFieldsTable.includes(historyKeys["keys"][i])) {
                            projectionObj[historyKeys["keys"][i]] = 1;
                        }
                    }

                    complexQueryProjectionObject = projectionObj;
                }

                if(Object.keys(mongoQueryObject.sceneQuery).length === 0) {
                    return mcsDB.db.collection('mcs_history').aggregate([
                        {$match: mongoQueryObject.historyQuery},
                        {$lookup:{'from': 'mcs_scenes', 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                        {$unwind:'$mcsScenes'},
                        {$project: complexQueryProjectionObject}
                    ]).toArray();
                } else {
                    return mcsDB.db.collection('mcs_history').aggregate([
                        {$match: mongoQueryObject.historyQuery},
                        {$lookup:{'from': 'mcs_scenes', 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                        {$unwind:'$mcsScenes'},
                        {$match: mongoQueryObject.sceneQuery},
                        {$project: complexQueryProjectionObject}
                    ]).toArray();
                }
            }

            let results = await getComplexResults();

            return {results: results, sceneMap: sceneFieldLabelMapTable, historyMap: historyFieldLabelMapTable};
        },
        getHomeStats: async(obj, args, context, infow)=> {
            let scoreStats = await mcsDB.db.collection('mcs_history').aggregate([
                {"$match": 
                    {
                      "eval": args.eval,
                    },
                },
                {"$group": 
                    {"_id": {
                        "correct": "$score.score", 
                        "plausibililty": "$score.ground_truth",
                        "performer": "$performer", 
                        "category": "$category",
                        "test_type": "$test_type",
                        "metadata": "$metadata",
                        "weight": "$score.weighted_score_worth",
                        "weight_score": "$score.weighted_score"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            let statsByScoreObject = statsByScore(scoreStats, false);
            let weighedStatsByScoreObject = statsByScore(scoreStats, true);

            let testTypeStats = await mcsDB.db.collection('mcs_history').aggregate([
                {"$match": 
                    {
                      "eval": args.eval,
                    },
                },
                {"$group": 
                    {"_id": {
                        "correct": "$score.score", 
                        "performer": "$performer", 
                        "category_type": "$category_type", 
                        "category": "$category",
                        "test_type": "$test_type",
                        "metadata": "$metadata",
                        "weight": "$score.weighted_score_worth",
                        "weight_score": "$score.weighted_score"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            let testTypeScores = statsByTestType(testTypeStats, false);
            let weightedTestTypeScores = statsByTestType(testTypeStats, true);

            let stats = {
                ...statsByScoreObject,
                ...testTypeScores
            };

            let weightedStats = {
                ...weighedStatsByScoreObject,
                ...weightedTestTypeScores
            }

            let statsObj = {
                stats: stats,
                weightedStats: weightedStats
            };

            return statsObj;
        }
    }, 
    Mutation: {
        saveComment: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('comments').insert({
                test: args["test"],
                block: args["block"],
                submission: args["submission"],
                performer: args["performer"],
                text: args["text"],
                createdDate: args["createdDate"],
                userName: args["userName"]
            });
        },
        saveCommentByTestAndScene: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('comments').insert({
                test_type: args["testType"],
                scene_num: args["sceneNum"],
                text: args["text"],
                createdDate: args["createdDate"],
                userName: args["userName"]
            });
        },
        updateSceneHistoryRemoveFlag: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_history').update(
                {"test_type": args["testType"], "scene_num":  args["sceneNum"]},
                {$set: {"flags.remove": args["flagRemove"]}},
                {multi: true}
            );
        },
        updateSceneHistoryInterestFlag: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_history').update(
                {"test_type": args["testType"], "scene_num":  args["sceneNum"]},
                {$set: {"flags.interest": args["flagInterest"]}},
                {multi: true}
            );
        },
        saveQuery: async (obj, args, context, infow) => {
            let queryObj;
            
            await mcsDB.db.collection('savedQueries').insertOne({
                user: args["user"],
                queryObj: args["queryObj"],
                name: args["name"],
                description: args["description"],
                createdDate: args["createdDate"]
            }).then( result => {
                queryObj = result.ops[0];
            });

            return queryObj;
        },
        updateQuery: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').update({_id: mongoDb.ObjectID(args["_id"])}, {$set: {
                queryObj: args["queryObj"],
                name: args["name"],
                description: args["description"],
                createdDate: args["createdDate"]
            }});
        },
        deleteQuery: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').remove({_id:  mongoDb.ObjectID(args["_id"])});
        }
    },
    StringOrFloat: new GraphQLScalarType({
        name: "StringOrFloat",
        description: "A String or a Float union type",
        serialize(value) {
          if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            throw new Error("Value must be either a String, Boolean, or an Int");
          }
    
          return value;
        },
        parseValue(value) {
          if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            throw new Error("Value must be either a String, Boolean, or an Int");
          }

          return value;
        },
        parseLiteral(ast) {
          switch (ast.kind) {
            case Kind.FLOAT: return parseFloat(ast.value);
            case Kind.STRING: return ast.value;
            case Kind.BOOLEAN: return ast.value;
            default:
              throw new Error("Value must be either a String, Boolean, or a Float");
          }
        }
    })
};

module.exports = {
    mcsTypeDefs,
    mcsResolvers
};