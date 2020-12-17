const { gql } = require('apollo-server');
const { mcsDB } = require('./server.mongo');
const { GraphQLScalarType, Kind } = require("graphql");
const { statsByScore, statsByTestType } = require('./server.statsFunctions');
const { createComplexMongoQuery } = require('./server.mongoSyntax');

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
      statsByTestType: JSON,
      statsByScore: JSON,
      statsByScorePercent: JSON
  }

  type savedQueryObj {
    user: JSON, 
    queryObj: JSON, 
    name: String, 
    description: String,
    createdDate: Float
  }

  type dropDownObj {
      value: String
      label: String
  }

  type Query {
    msc_eval: [Source]
    getEvalHistory(testType: String, sceneNum: String) : [History]
    getEvalScene(testType: String, sceneNum: String) : [Scene]
    getEvalByTest(test: String) : [Source]
    getEvalByBlock(block: String) : [Source]
    getEvalBySubmission(submission: String) : [Source]
    getEvalByPerformer(performer: String) : [Source]
    getEvalAnalysis(test: String, block: String, submission: String, performer: String) : [Source]
    getComments(test: String, block: String, submission: String, performer: String) : [Comment]
    getCommentsByTestAndScene(testType: String, sceneNum: String) : [NewComment]
    getFieldAggregation(fieldName: String) : [String]
    getSubmissionFieldAggregation: [SubmissionPerformer]
    getHistorySceneFieldAggregation(fieldName: String) : [StringOrFloat]
    getSceneFieldAggregation(fieldName: String) : [StringOrFloat]
    getAllHistoryFields: [dropDownObj]
    getAllSceneFields: [dropDownObj],
    createComplexQuery(queryObject: JSON): [JSON]
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
  }
`;

const mcsResolvers = {
    Query: {
        msc_eval: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('msc_eval').find({})
                .toArray().then(result => {return result});
        },
        getEvalHistory: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_history').find({'test_type': args["testType"], 'scene_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getEvalScene: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_scenes').find({'test_type': args["testType"], 'scene_num': args["sceneNum"]})
                .toArray().then(result => {return result});
        },
        getHistorySceneFieldAggregation: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_history').distinct(args["fieldName"]).then(result => {return result});
        },
        getSceneFieldAggregation: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('mcs_scenes').distinct(args["fieldName"]).then(result => {return result});
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
            return await mcsDB.db.collection('msc_eval').distinct(args["fieldName"]).then(result => {return result});
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
                returnArray.push({label: historyKeys[i], value: historyKeys[i]});
            }

            return returnArray;
        },
        getAllSceneFields: async(obj, args, context, infow) => {
            let returnArray = [];
            const results =  await mcsDB.db.collection('mcs_scenes_keys').findOne();
            const sceneKeys = results.keys;
            for(let i=0; i < sceneKeys.length; i++) {
                returnArray.push({label: sceneKeys[i], value: sceneKeys[i]});
            }

            return returnArray;
        },
        getSavedQueries: async(obj, args, context, infow) => {
            return await mcsDB.db.collection('savedQueries').find()
                .toArray().then(result => {return result});
        },
        createComplexQuery: async(obj, args, context, infow)=> {
            mongoQueryObject = createComplexMongoQuery(args['queryObject']);

            async function getComplexResults() {
                const historyKeys = await mcsDB.db.collection('mcs_history_keys').findOne();

                let projectionObj = {scene: "$mcsScenes"};
                for(let i=0; i < historyKeys["keys"].length; i++) {
                    projectionObj[historyKeys["keys"][i]] = 1;
                }

                return mcsDB.db.collection('mcs_history').aggregate([
                    {$lookup:{'from': 'mcs_scenes', 'localField':'name', 'foreignField': 'name', 'as': 'mcsScenes'}},
                    {$unwind:'$mcsScenes'},
                    {$match: mongoQueryObject},
                    {$project: projectionObj}
                ]).toArray();
            }

            results = await getComplexResults();

            return results;
        },
        getHomeStats: async(obj, args, context, infow)=> {
            let statsObj = {};

            scoreStats = await mcsDB.db.collection('mcs_history').aggregate([
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
                        "category": "$category"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            const statsByScoreObject = statsByScore(scoreStats);
            statsObj["statsByScore"] = statsByScoreObject["byNumber"];
            statsObj["statsByScorePercent"] = statsByScoreObject["byPercent"];

            testTypeStats = await mcsDB.db.collection('mcs_history').aggregate([
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
                        "category": "$category"
                    }, 
                    "count": {"$sum": 1}}
                }]).toArray();

            let testTypeScores = statsByTestType(testTypeStats);

            statsObj["statsByTestType"] = testTypeScores;

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
            return await mcsDB.db.collection('savedQueries').insert({
                user: args["user"],
                queryObj: args["queryObj"],
                name: args["name"],
                description: args["description"],
                createdDate: args["createdDate"]
            });
        },
    },
    StringOrFloat: new GraphQLScalarType({
        name: "StringOrFloat",
        description: "A String or a Float union type",
        serialize(value) {
          if (typeof value !== "string" && typeof value !== "number") {
            throw new Error("Value must be either a String or an Int");
          }
    
          return value;
        },
        parseValue(value) {
          if (typeof value !== "string" && typeof value !== "number") {
            throw new Error("Value must be either a String or an Int");
          }

          return value;
        },
        parseLiteral(ast) {
          switch (ast.kind) {
            case Kind.FLOAT: return parseFloat(ast.value);
            case Kind.STRING: return ast.value;
            default:
              throw new Error("Value must be either a String or a Float");
          }
        }
    })
};

module.exports = {
    mcsTypeDefs,
    mcsResolvers
};