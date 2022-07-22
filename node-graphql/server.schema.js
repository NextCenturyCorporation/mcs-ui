const { gql } = require('apollo-server');
const { mcsDB } = require('./server.mongo');
const mongoDb = require("mongodb");
const { MONGO_DB, BUCKET } = require('./config');
const { GraphQLScalarType, Kind } = require("graphql");
const { getChartOptions, getChartData, processHyperCubeStats } = require('./server.statsFunctions');
const { createComplexMongoQuery } = require('./server.mongoSyntax');
const {  historyFieldLabelMap, historyExcludeFields, sceneExcludeFields,  sceneFieldLabelMap, historyIncludeFieldsTable, 
    sceneIncludeFieldsTable, historyFieldLabelMapTable, sceneFieldLabelMapTable } = require('./server.fieldMappings');
const spawn = require("child_process").spawn;
const urlExist = require("url-exist");

let complexQueryProjectionObject = null;
const HISTORY_COLLECTION = "mcs_history";
const HISTORY_COLLECTION_MAPPING = "history_mapping";
const SCENES_COLLECTION_MAPPING = "scenes_mapping";

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
    slices: [String]
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
    fullFilename: String
    corner_visit_order: [JSON]
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
    getCompletedEvals: JSON
    getHistoryCollectionMapping: JSON
    getSceneCollectionMapping: JSON
    getEvalHistory(eval: String, categoryType: String, testNum: Int) : [History]
    getLinkStatus(url: String): Boolean
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
    createComplexQuery(queryObject: JSON, projectionObject: JSON, currentPage: Int, resultsPerPage: Int, sortBy: String, sortOrder: String, groupBy: String): JSON
    getSavedQueries: [savedQueryObj]
    getScenesAndHistoryTypes: [dropDownObj]
    getEvaluationStatus(eval: String, evalName: String): JSON
    getUsers: JSON
    getEvalTestTypes(eval: String): JSON
    getHomeChartOptions(eval: String, evalType: String): JSON
    getHomeChart(eval: String, evalType: String, isPercent: Boolean, metadata: String, isPlausibility: Boolean, isNovelty: Boolean, isWeighted: Boolean, useDidNotAnswer: Boolean): JSON
    getTestOverviewData(eval: String, categoryType: String, performer: String, metadata: String, useDidNotAnswer: Boolean, weightedPassing: Boolean): JSON
    getScoreCardData(eval: String, categoryType: String, performer: String, metadata: String): JSON
  }

  type Mutation {
    updateSceneHistoryRemoveFlag(catTypePair: String, testNum: Int, flagRemove: Boolean) : updateObject
    updateSceneHistoryInterestFlag(catTypePair: String, testNum: Int, flagInterest: Boolean) : updateObject
    saveQuery(user: JSON, queryObj: JSON, groupBy: JSON, sortBy: JSON, name: String, description: String, createdDate: Float) : savedQueryObj
    updateQuery(queryObj: JSON, groupBy: JSON, sortBy: JSON, name: String, description: String, createdDate: Float, _id: String) : savedQueryObj
    updateQueryNameAndDescriptionOnly(name: String, description: String, createdDate: Float, _id: String) : savedQueryObj
    deleteQuery(_id: String) : savedQueryObj
    setEvalStatusParameters(eval: String, evalStatusParams: JSON) : JSON
    createCSV(collectionName: String, eval: String): JSON
    updateAdminUser(username: String, isAdmin: Boolean): JSON
    updateCompletedEvals(completedEvals: [String]) : JSON
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
        getCompletedEvals: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('completedEvals').findOne()
                .then(result => {return result});
        },
        getLinkStatus: async(obj, args, context, infow) => {
            return await urlExist(args["url"]);
        },
        getEval2History: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection('eval_2_results').find({'cat_type_pair': args["catTypePair"], 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getEval2Scene: async(obj, args, context, infow) => {
            // Eval 2
            return await mcsDB.db.collection('eval_2_scenes').find({'test_type': args["testType"], 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getEvalScene: async(obj, args, context, infow) => {
            // Eval 3 onwards
            return await mcsDB.db.collection(args.eval.replace("results", "scenes")).find({'name': {$regex: args["sceneName"]}, 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getEvalHistory: async(obj, args, context, infow) => {
            // Eval 3 onwards
            return await mcsDB.db.collection(args.eval).find({'category_type': args["categoryType"], 'test_num': args["testNum"]})
                .toArray().then(result => {return result});
        },
        getHistoryCollectionMapping: async(obj, args, context, infow) => {
            let returnArray = [];
            const historyEvals = await mcsDB.db.collection(HISTORY_COLLECTION_MAPPING).find().toArray().then(result => {return result});

            for(let i=0; i < historyEvals.length; i++) {
                returnArray.push({label: historyEvals[i].name, value: historyEvals[i].collection});
            }

            return returnArray;
        },
        getSceneCollectionMapping: async(obj, args, context, infow) => {
            let returnArray = [];
            const sceneEvals = await mcsDB.db.collection(SCENES_COLLECTION_MAPPING).find().toArray().then(result => {return result});

            for(let i=0; i < sceneEvals.length; i++) {
                returnArray.push({label: sceneEvals[i].name, value: sceneEvals[i].collection});
            }

            return returnArray;
        },
        getHistorySceneFieldAggregation: async(obj, args, context, infow) => {
            let whereClause = {};

            if(args["catType"]) {
                if(args["eval"] === "eval_2_results") {
                    whereClause["cat_type_pair"] = args["catType"];
                } else {
                    whereClause["category_type"] = args["catType"];
                }
            }

            return await mcsDB.db.collection(args["eval"]).distinct(args["fieldName"], whereClause).then(result => {return result});
        },
        getSceneFieldAggregation: async(obj, args, context, infow) => {
            return await mcsDB.db.collection(args["eval"]).distinct(args["fieldName"]).then(result => {return result});
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

            const historyEvals = await mcsDB.db.collection(HISTORY_COLLECTION_MAPPING).find().toArray().then(result => {return result});
            for(let i=0; i < historyEvals.length; i++) {
                returnArray.push({label: historyEvals[i].name, value: historyEvals[i].collection});
            }

            const sceneEvals = await mcsDB.db.collection(SCENES_COLLECTION_MAPPING).find().toArray().then(result => {return result});
            for(let i=0; i < sceneEvals.length; i++) {
                returnArray.push({label: sceneEvals[i].name, value: sceneEvals[i].collection});
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

            const statusObj = await mcsDB.db.collection('eval_status').find({"eval": args.evalName})
                .toArray().then(result => {return result});

            const evalHistoryCollection = args.eval.replace("scenes", "results");
            const evalSceneCollection = args.eval;

            const performers =  await mcsDB.db.collection(evalHistoryCollection).distinct("performer").then(result => {return result});
            const metadatas =  await mcsDB.db.collection(evalHistoryCollection).distinct("metadata").then(result => {return result});

            for(let i=0; i < performers.length; i++) {
                performersArray.push({label: performers[i], value: performers[i]});
            }
            for(let i=0; i < metadatas.length; i++) {
                metadataArray.push({label: metadatas[i], value: metadatas[i]});
            }

            const evalStats = await mcsDB.db.collection(evalHistoryCollection).aggregate([
                {"$group": 
                    {"_id": {
                        "performer": "$performer", 
                        "metadata": "$metadata",
                        "category_type": "$category_type"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            const sceneStats = await mcsDB.db.collection(evalSceneCollection).aggregate([
                {"$group": 
                    {"_id": {
                        "sceneType": "$goal.sceneInfo.tertiaryType"
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
                    let projectionObj = {};

                    for(let j=0; j < sceneIncludeFieldsTable.length; j++) {
                        projectionObj["scene." + sceneIncludeFieldsTable[j]] = "$mcsScenes." + sceneIncludeFieldsTable[j];
                    }

                    for(let i=0; i < historyIncludeFieldsTable.length; i++) {
                        projectionObj[historyIncludeFieldsTable[i]] = 1;
                    }

                    complexQueryProjectionObject = projectionObj;
                }

                // Build Sort Parameters before creating the pipeline
                let sortObj = {}
                let sceneSort = false;
                if(args["sortBy"] !== null && args["sortBy"] !== undefined && args["sortBy"] !== ""){
                    const sortOrder = args["sortOrder"] === "asc" ? 1 : -1;
                    sortObj[args["sortBy"]] = sortOrder;
                    sceneSort = args["sortBy"].indexOf("scene.") > -1 ? true : false;
                }

                // Dynamically Build the aggregation pipeline, starting with an initial match
                let aggregationObjectArray = [{$match: mongoQueryObject.historyQuery}];

                // If we are not sorting on a scene field, it is better to sort early before the unwind otherwise
                //   you can't take advantage of any indexes and the sort is very slow.
                if(Object.keys(sortObj).length !== 0 && !sceneSort) {
                    aggregationObjectArray.push({$sort: sortObj});
                }

                // Here we add the rest of the pipeline, the lookup finds the matching scene file, unwind flattens the scene file
                //   into the history file, and redact removes any duplicate scene file records if from a different eval
                aggregationObjectArray = aggregationObjectArray.concat([
                    {$lookup:{'from': mongoQueryObject.sceneCollection, 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                    {$unwind:'$mcsScenes'},
                    {$redact: {$cond: [{$eq: ["$evalNumber", "$mcsScenes.evalNumber"]}, "$$KEEP", "$$PRUNE"]}}
                ]);

                // If the performer used any query parameters from a scene object we now reduce the returned history results to 
                //   only return objects that meet the scene requirements
                if(Object.keys(mongoQueryObject.sceneQuery).length > 0) {
                    aggregationObjectArray.push({$match: mongoQueryObject.sceneQuery});
                } 

                // if the sort is on a scene field, we have to wait until after removing all non matching scenes before 
                //    doing the sort
                if(Object.keys(sortObj).length !== 0 && sceneSort) {
                    aggregationObjectArray.push({$sort: sortObj});
                }

                const groupQueryData = {
                    total: {$sum: 1},
                    totalWeighted: {$sum: "$score.weighted_score_worth"},
                    totalCorrect: {$sum: "$score.score"},
                    totalCorrectWeighted: {$sum: {$cond: {if: {$eq: ["$score.weighted_score_worth", "$score.weighted_score"]}, then: "$score.weighted_score_worth", else: {$multiply: ["$score.weighted_score", "$score.weighted_score_worth"]}}}},
                    totalNoAnswer: {$sum: {$cond: {if: {$eq: ["$score.score_description", "No answer"]}, then: 1, else: 0}}}
                }

                // Add grouping here 
                if(args["groupBy"] !== null && args["groupBy"] !== undefined && args["groupBy"] !== ""){
                    aggregationObjectArray.push(
                        {$facet: {
                            results: [
                                { $group: {
                                    _id: {"groupField": "$" + args["groupBy"]}, 
                                    ... groupQueryData
                                }}
                            ],
                            metadata: [
                                { $group: {
                                    _id: null,
                                    ...groupQueryData
                                }}
                            ]
                        }}
                    );
                } else {
                    // Add the pagination features here, along with return metadata for the displayed statistics
                    aggregationObjectArray.push(
                        {$facet: {
                            results: [{$skip: args["currentPage"] * args["resultsPerPage"]}, {$limit: args["resultsPerPage"]}, {$project: complexQueryProjectionObject}],
                            metadata: [
                                { $group: {
                                    _id: null,
                                    ...groupQueryData
                                }}
                            ]
                        }}
                    );
                }

                return mcsDB.db.collection(mongoQueryObject.historyCollection).aggregate(aggregationObjectArray, { "allowDiskUse" : true }).toArray();
            }

            let results = await getComplexResults();

            return {results: results, sceneMap: sceneFieldLabelMapTable, historyMap: historyFieldLabelMapTable, historyCollection: mongoQueryObject.historyCollection};
        },
        getEvalTestTypes: async(obj, args, context, infow)=> {
            return await mcsDB.db.collection(args.eval).aggregate( 
                [
                    {"$group": { "_id": { testType: "$test_type", category: "$category" } } }
                ]
            ).toArray();;
        },
        getHomeChartOptions: async(obj, args, context, infow)=> {
            const metadata =  await mcsDB.db.collection(args.eval).distinct(
                "metadata", {"test_type": args.evalType}).then(result => {return result});

            const hasNovelty = await mcsDB.db.collection(args.eval.replace("results", "scenes")).find({
                "goal.sceneInfo.untrained.any": true, "goal.sceneInfo.secondaryType": args.evalType}).count() > 0;
            
            return getChartOptions(args.evalType, metadata, hasNovelty);
        },
        getHomeChart: async(obj, args, context, infow)=> {
            let groupObject = {
                "performer": "$performer",
                "correct": "$score.score",
                "description": "$score.score_description",
                "weight": "$score.weighted_score_worth",
                "weight_score": "$score.weighted_score"
            };

            let searchObject = {
                "test_type": args.evalType
            };

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

            let scoreStats = await mcsDB.db.collection(args.eval).aggregate([
                    {"$match": searchObject}, {"$group": {"_id": groupObject, "count": {"$sum": 1}}
                }]).toArray();

            scoreStats.sort((a, b) => (a._id.performer > b._id.performer) ? 1 : -1);

            return getChartData(args.isPlausibility, args.isPercent, scoreStats, args.isWeighted, args.evalType, args.isNovelty, args.useDidNotAnswer);
        },
        getUsers: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('users').find().project({"services":0, "createdAt":0, "updatedAt": 0})
                .toArray().then(result => {return result});
            
        },
        getTestOverviewData: async(obj, args, context, infow) =>{
            const searchObject = {
                "category_type": args.categoryType,
                "performer": args.performer,
                "metadata": args.metadata
            };

            const projectObject = {
                "correct": "$score.score",
                "hypercube_id": "$scene_goal_id",
                "groundTruth": "$score.ground_truth",
                "testType": "$test_type",
                "description": "$score.score_description"
            };

            if(args.weightedPassing) {
                projectObject["scoreWorth"] = "$score.weighted_score_worth";
            } else {
                projectObject["scoreWorth"] = {"$literal": 1};
            }

            if(args.categoryType.toLowerCase().indexOf("agents") > -1) {
                projectObject["hypercube_id"] = "$category_type"
            }

            const hypercubeStats = await mcsDB.db.collection(args.eval).aggregate([
                {"$match": searchObject}, {"$group": {"_id": projectObject, "count": {"$sum": 1}}
            }]).toArray();

            return processHyperCubeStats(hypercubeStats, args.useDidNotAnswer);
        },
        getScoreCardData: async(obj, args, context, infow) =>{
            const searchObject = {
                "category_type": args.categoryType,
                "performer": args.performer,
                "metadata": args.metadata
            };

            const groupObject = {
                "_id": {"hypercubeID": "$scene_goal_id"},
                "totalAttemptImpossible": { "$sum" : "$score.scorecard.attempt_impossible" },
                "totalOpenUnopenable": { "$sum" : "$score.scorecard.open_unopenable.total_unopenable_attempts" },
                "totalRepeatFailed": { "$sum" : "$score.scorecard.repeat_failed.total_repeat_failed" },
                "totalContainerRelook": { "$sum" : "$score.scorecard.container_relook" },
                "totalNotMovingTowardObject": { "$sum" : "$score.scorecard.not_moving_toward_object" },
                "totalRevisits": { "$sum" : "$score.scorecard.revisits" },
                "totalCorrectPlatform": {
                    "$sum": {
                        "$cond": [ "$score.scorecard.correct_platform_side", 1, 0 ]
                    }
                },
                "totalCorrectDoorOpened": {
                    "$sum": {
                        "$cond": [ "$score.scorecard.correct_door_opened", 1, 0 ]
                    }
                },
                "totalFastestPath": {
                    "$sum": {
                        "$cond": [ "$score.scorecard.fastest_path", 1, 0 ]
                    }
                },
                // start ramp stats
                "totalRampWentUp": { "$sum" : "$score.scorecard.ramp_actions.went_up" },
                "totalRampWentDown": { "$sum" : "$score.scorecard.ramp_actions.went_down" },
                "totalRampWentUpAbandoned": { "$sum" : "$score.scorecard.ramp_actions.went_up_abandoned" },
                "totalRampWentDownAbandoned": { "$sum" : "$score.scorecard.ramp_actions.went_down_abandoned" },
                "totalRampFellOff": { "$sum" : "$score.scorecard.ramp_actions.ramp_fell_off" },
                // end ramp stats
                // start tool use stats
                "totalMoveToolSuccess": { 
                    "$sum" : {
                        "$add": [
                            { "$ifNull": ["$score.scorecard.tool_usage.MoveObject", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.PushObject", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.PullObject", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.RotateObject", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.TorqueObject", 0] }
                        ]
                    }
                },
                "totalMoveToolFailure": { 
                    "$sum" : {
                        "$add": [
                            { "$ifNull": ["$score.scorecard.tool_usage.MoveObject_failed", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.PushObject_failed", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.PullObject_failed", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.RotateObject_failed", 0] },
                            { "$ifNull": ["$score.scorecard.tool_usage.TorqueObject_failed", 0] }
                        ]
                    }
                },
                // end tool use stats
                "totalPickupNotPickupable": { "$sum" : "$score.scorecard.pickup_not_pickupable" },
                "totalInteractWithNonAgent": { "$sum" : "$score.scorecard.interact_with_non_agent" },
                "totalWalkedIntoStructures": { "$sum" : "$score.scorecard.walked_into_structures" }
            }

            const scoreCardStats = await mcsDB.db.collection(args.eval).aggregate([
                {"$match": searchObject}, {"$group": groupObject}
            ]).toArray();

            scoreCardStats.sort((a, b) => (a._id.hypercubeID > b._id.hypercubeID) ? 1 : -1);

            return scoreCardStats;
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
        updateQueryNameAndDescriptionOnly: async (obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').update({_id: mongoDb.ObjectID(args["_id"])}, {$set: {
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
        updateCompletedEvals: async(obj, args, context, infow) => { 
            let completedEvals = await mcsDB.db.collection('completedEvals').findOne();
            if (completedEvals === null) {
                await mcsDB.db.collection('completedEvals').insertOne({
                    completedEvals: []
                });
                completedEvals = await mcsDB.db.collection('completedEvals').findOne();
            }
            return await mcsDB.db.collection('completedEvals').update({"_id": completedEvals["_id"]}, {$set: {
                completedEvals: args["completedEvals"]
            }});
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