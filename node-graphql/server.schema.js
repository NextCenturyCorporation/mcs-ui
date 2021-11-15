const { gql } = require('apollo-server');
const { mcsDB } = require('./server.mongo');
const mongoDb = require("mongodb");
const { MONGO_DB, BUCKET } = require('./config');
const { GraphQLScalarType, Kind } = require("graphql");
const { getChartOptions, getChartData } = require('./server.statsFunctions');
const { createComplexMongoQuery } = require('./server.mongoSyntax');
const {  historyFieldLabelMap, historyExcludeFields, sceneExcludeFields,  sceneFieldLabelMap, historyExcludeFieldsTable, 
    sceneExcludeFieldsTable, historyFieldLabelMapTable, sceneFieldLabelMapTable } = require('./server.fieldMappings');
const spawn = require("child_process").spawn;

let complexQueryProjectionObject = null;
const HISTORY_COLLECTION = "mcs_history";
const SCENES_COLLECTION = "mcs_scenes";

const mcsTypeDefs = gql`
  scalar JSON

  scalar StringOrFloat

  extend input CreateUserInput {
    admin: Boolean
  }

  extend type User {
    admin: Boolean
  }

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

  type History {
    eval: String
    performer: String
    name: String
    test_type: String
    test_num: Int
    scene_num: Int
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
    test_num: Int
    scene_num: Int
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
      performers: [String]
  }

  type savedQueryObj {
    user: JSON, 
    queryObj: JSON,
    groupBy: JSON,
    sortBy: JSON,
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
    getEval2History(catTypePair: String, testNum: Int) : [History]
    getEval2Scene(testType: String, testNum: Int) : [Scene]
    getEvalScene(eval: String, sceneName: String, testNum: Int) : [Scene]
    getEvalByTest(test: String) : [Source]
    getEvalByBlock(block: String) : [Source]
    getEvalBySubmission(submission: String) : [Source]
    getEvalByPerformer(performer: String) : [Source]
    getEvalAnalysis(test: String, block: String, submission: String, performer: String) : [Source]
    getFieldAggregation(fieldName: String, eval: String) : [String]
    getSubmissionFieldAggregation: [SubmissionPerformer]
    getHistorySceneFieldAggregation(fieldName: String, eval: String, catType: String) : [StringOrFloat]
    getSceneFieldAggregation(fieldName: String, eval: String) : [StringOrFloat]
    getCollectionFields(collectionName: String): [dropDownObj]
    createComplexQuery(queryObject: JSON, projectionObject: JSON): JSON
    getSavedQueries: [savedQueryObj]
    getScenesAndHistoryTypes: [dropDownObj]
    getEvaluationStatus(eval: String): JSON
    getUsers: JSON
    getEvalTestTypes(eval: String): [String]
    getHomeChartOptions(eval: String, evalType: String): JSON
    getHomeChart(eval: String, evalType: String, isPercent: Boolean, metadata: String, isPlausibility: Boolean, isNovelty: Boolean, isWeighted: Boolean): JSON
  }

  type Mutation {
    updateSceneHistoryRemoveFlag(catTypePair: String, testNum: Int, flagRemove: Boolean) : updateObject
    updateSceneHistoryInterestFlag(catTypePair: String, testNum: Int, flagInterest: Boolean) : updateObject
    saveQuery(user: JSON, queryObj: JSON, groupBy: JSON, sortBy: JSON, name: String, description: String, createdDate: Float) : savedQueryObj
    updateQuery(queryObj: JSON, groupBy: JSON, sortBy: JSON, name: String, description: String, createdData: Float, _id: String) : savedQueryObj
    deleteQuery(_id: String) : savedQueryObj
    setEvalStatusParameters(eval: String, evalStatusParams: JSON) : JSON
    createCSV(collectionName: String, eval: String): JSON
    updateAdminUser(username: String, isAdmin: Boolean): JSON
  }
`;

const getEvalNumFromString = (strValue) => {
    return strValue.replace(/\D+\.?\D+/g, "");
}

const mcsResolvers = {
    Query: {
        msc_eval: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({})
                .toArray().then(result => {return result});
        },
        getEval2History: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection(HISTORY_COLLECTION).find({'eval': "Evaluation 2 Results", 
                'cat_type_pair': args["catTypePair"], 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getEval2Scene: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection(SCENES_COLLECTION).find({'eval': "Evaluation 2 Scenes", 'test_type': args["testType"], 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getEvalScene: async(obj, args, context, infow) => {
            // Eval 3 onwards
            let evalNum = getEvalNumFromString(args["eval"]);
            let sceneEvalName = "Evaluation " + evalNum + " Scenes";

            return await mcsDB.db.collection(SCENES_COLLECTION).find({'eval': sceneEvalName, 'name': {$regex: args["sceneName"]}, 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getHistorySceneFieldAggregation: async(obj, args, context, infow) => {
            let whereClause = {};
            if(args["eval"]) {
                whereClause["eval"] = args["eval"];

                if(args["catType"]) {
                    if(args["eval"] === "Evaluation 2 Results") {
                        whereClause["cat_type_pair"] = args["catType"];
                    } else {
                        whereClause["category_type"] = args["catType"];
                    }
                }
            }

            return await mcsDB.db.collection(HISTORY_COLLECTION).distinct(args["fieldName"], whereClause).then(result => {return result});
        },
        getSceneFieldAggregation: async(obj, args, context, infow) => {
            if(args["eval"]) {
                return await mcsDB.db.collection(SCENES_COLLECTION).distinct(args["fieldName"], {"eval": args["eval"]}).then(result => {return result});
            } else {
                return await mcsDB.db.collection(SCENES_COLLECTION).distinct(args["fieldName"]).then(result => {return result});
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
        getFieldAggregation: async(obj, args, context, infow) => {
            if(args["eval"]) {
                return await mcsDB.db.collection('msc_eval').distinct(args["fieldName"], {"eval": args["eval"]}).then(result => {return result});
            } else {
                return await mcsDB.db.collection('msc_eval').distinct(args["fieldName"]).then(result => {return result});
            }
        },
        getScenesAndHistoryTypes: async(obj, args, context, infow) => {
            let returnArray = [];
            const historyEvals = await mcsDB.db.collection(HISTORY_COLLECTION).distinct("eval");
            for(let i=0; i < historyEvals.length; i++) {
                returnArray.push({label: historyEvals[i], value: HISTORY_COLLECTION + "." + historyEvals[i]});
            }

            const sceneEvals = await mcsDB.db.collection(SCENES_COLLECTION).distinct("eval");
            for(let i=0; i < sceneEvals.length; i++) {
                returnArray.push({label: sceneEvals[i], value: SCENES_COLLECTION + "." + sceneEvals[i]});
            }
            
            return returnArray;
        },
        getSubmissionFieldAggregation: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').aggregate([{$group: {_id: '$performer', submission: {$addToSet: '$submission'}}}])
                .toArray().then(result => {return result});
        },
        getEvaluationStatus: async(obj, args, context, infow) => {
            let performersArray = [];
            let metadataArray = [];

            const statusObj = await mcsDB.db.collection('eval_status').find({"eval": args.eval})
                .toArray().then(result => {return result});

            const performers =  await mcsDB.db.collection(HISTORY_COLLECTION).distinct("performer").then(result => {return result});
            const metadatas =  await mcsDB.db.collection(HISTORY_COLLECTION).distinct("metadata").then(result => {return result});

            for(let i=0; i < performers.length; i++) {
                performersArray.push({label: performers[i], value: performers[i]});
            }
            for(let i=0; i < metadatas.length; i++) {
                metadataArray.push({label: metadatas[i], value: metadatas[i]});
            }

            const evalListStr =  args.eval.split(" ");
            const regexObj = {$options: 'i', $regex: ".*" + (evalListStr[0] + " " + evalListStr[1]) + ".*"};

            const evalStats = await mcsDB.db.collection(HISTORY_COLLECTION).aggregate([
                {"$match": 
                    {
                      "eval": regexObj,
                    },
                },
                {"$group": 
                    {"_id": {
                        "performer": "$performer", 
                        "metadata": "$metadata",
                        "test_type": "$test_type"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            const sceneStats = await mcsDB.db.collection(SCENES_COLLECTION).aggregate([
                {"$match": 
                    {
                        "eval": regexObj,
                    },
                },
                {"$group": 
                    {"_id": {
                        "sceneType": "$goal.sceneInfo.secondaryType"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            return {
                statusObj: statusObj,
                evalStats: evalStats,
                performers: performersArray,
                metadatas: metadataArray,
                sceneStats: sceneStats
            };
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
                    let historyKeys = [], sceneKeys = [];
                    let evalNumber;

                    if(mongoQueryObject.historyQuery["eval"] !== undefined) {
                        evalNumber = getEvalNumFromString(mongoQueryObject.historyQuery["eval"]);
                    } else {
                        evalNumber = getEvalNumFromString(mongoQueryObject.sceneQuery["mcsScenes.eval"]);
                    }

                    const historyEvalName = "Evaluation " + evalNumber + " Results";
                    const sceneEvalName = "Evaluation " + evalNumber + " Scenes";

                    const historyResults =  await mcsDB.db.collection('collection_keys').findOne({"name": historyEvalName});
                    historyKeys = historyResults.keys;

                    const sceneResults =  await mcsDB.db.collection('collection_keys').findOne({"name": sceneEvalName});
                    sceneKeys = sceneResults.keys;

                    let projectionObj = {};

                    for(let j=0; j < sceneKeys.length; j++) {
                        if(!sceneExcludeFieldsTable.includes(sceneKeys[j])) {
                            projectionObj["scene." + sceneKeys[j]] = "$mcsScenes." + sceneKeys[j];
                        }
                    }

                    for(let i=0; i < historyKeys.length; i++) {
                        if(!historyExcludeFieldsTable.includes(historyKeys[i])) {
                            projectionObj[historyKeys[i]] = 1;
                        }
                    }

                    complexQueryProjectionObject = projectionObj;
                }

                if(Object.keys(mongoQueryObject.sceneQuery).length === 0) {
                    return mcsDB.db.collection(HISTORY_COLLECTION).aggregate([
                        {$match: mongoQueryObject.historyQuery},
                        {$lookup:{'from': SCENES_COLLECTION, 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                        {$unwind:'$mcsScenes'},
                        {$project: complexQueryProjectionObject}
                    ]).toArray();
                } else {
                    return mcsDB.db.collection(HISTORY_COLLECTION).aggregate([
                        {$match: mongoQueryObject.historyQuery},
                        {$lookup:{'from': SCENES_COLLECTION, 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                        {$unwind:'$mcsScenes'},
                        {$match: mongoQueryObject.sceneQuery},
                        {$project: complexQueryProjectionObject}
                    ]).toArray();
                }
            }

            let results = await getComplexResults();

            return {results: results, sceneMap: sceneFieldLabelMapTable, historyMap: historyFieldLabelMapTable};
        },
        getEvalTestTypes: async(obj, args, context, infow)=> {
            return await mcsDB.db.collection(HISTORY_COLLECTION).distinct(
                "test_type", {"eval": args.eval}).then(result => {return result});
        },
        getHomeChartOptions: async(obj, args, context, infow)=> {
            const metadata =  await mcsDB.db.collection(HISTORY_COLLECTION).distinct(
                "metadata", {"eval": args.eval, "test_type": args.evalType}).then(result => {return result});

            const hasNovelty = await mcsDB.db.collection(SCENES_COLLECTION).find({
                "goal.sceneInfo.untrained.any": true, "eval": args.eval.replace("Results", "Scenes"), 
                    "goal.sceneInfo.secondaryType": args.evalType}).count() > 0;
            
            return getChartOptions(args.evalType, metadata, hasNovelty);
        },
        getHomeChart: async(obj, args, context, infow)=> {
            let groupObject = {
                "performer": "$performer",
                "correct": "$score.score"
            };

            let searchObject = {
                "eval": args.eval,
                "test_type": args.evalType
            };

            if(args.evalType !== 'interactive') {
                groupObject["weight"] = "$score.weighted_score_worth";
                groupObject["weight_score"] = "$score.weighted_score";
            }

            if(args.metadata !== "total" && args.metadata !== undefined && args.metadata !== null) {
                searchObject["metadata"] = args.metadata;
            };

            if(args.isPlausibility) {
                groupObject["plausibililty"] = "$score.ground_truth";
            } else if(args.isNovelty) {
                groupObject["hasNovelty"] = "$hasNovelty";
            } else {
                groupObject["category_type"] = "$category_type";
            }

            let scoreStats = await mcsDB.db.collection(HISTORY_COLLECTION).aggregate([
                    {"$match": searchObject}, {"$group": {"_id": groupObject, "count": {"$sum": 1}}
                }]).toArray();

            scoreStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

            return getChartData(args.isPlausibility, args.isPercent, scoreStats, args.isWeighted, args.evalType, args.isNovelty);
        },
        getUsers: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('users').find().project({"services":0, "createdAt":0, "updatedAt": 0})
                .toArray().then(result => {return result});
            
        }
    }, 
    Mutation: {
        updateSceneHistoryRemoveFlag: async (obj, args, context, infow) => {
            return await mcsDB.db.collection(HISTORY_COLLECTION).update(
                {"cat_type_pair": args["catTypePair"], "test_num":  args["testNum"]},
                {$set: {"flags.remove": args["flagRemove"]}},
                {multi: true}
            );
        },
        updateSceneHistoryInterestFlag: async (obj, args, context, infow) => {
            return await mcsDB.db.collection(HISTORY_COLLECTION).update(
                {"cat_type_pair": args["catTypePair"], "test_num":  args["testNum"]},
                {$set: {"flags.interest": args["flagInterest"]}},
                {multi: true}
            );
        },
        setEvalStatusParameters: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('eval_status').update(
                {"eval": args.eval},
                {"eval": args.eval, "evalStatusParams": args.evalStatusParams},
                {upsert: true}
            );
        },
        saveQuery: async (obj, args, context, infow) => {
            let queryObj;
            
            await mcsDB.db.collection('savedQueries').insertOne({
                user: args["user"],
                queryObj: args["queryObj"],
                groupBy: args["groupBy"],
                sortBy: args["sortBy"],
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
                groupBy: args["groupBy"],
                sortBy: args["sortBy"],
                name: args["name"],
                description: args["description"],
                createdDate: args["createdDate"]
            }});
        },
        deleteQuery: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').remove({_id:  mongoDb.ObjectID(args["_id"])});
        },
        createCSV: async(obj, args, context, infow) => { 
            const pythonProcess = spawn('python3',["./csv-scripts/generate_csv.py", args["collectionName"], args["eval"], MONGO_DB, BUCKET]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            pythonProcess.stderr.on('data', (data) => {
                console.log(data.toString());
            });
            return {message: "CSV creation launched."};
        },
        updateAdminUser: async(obj, args, context, infow) => { 
            return await mcsDB.db.collection('users').update(
                {"username": args["username"]}, 
                {$set: {"admin": args["isAdmin"]}}
            );
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