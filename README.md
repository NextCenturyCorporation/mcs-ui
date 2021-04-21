# mcs-ui
UI Applications for MCS

# Running from docker

Verify that node-graphql/account-configs.js exists.  If it does not, ask a team member for a copy

docker build --tag node-graphql node-graphql/.
docker build --tag analysis-ui analysis-ui/.
docker build --tag analysis-ui-staging analysis-ui/. --build-arg PORT_ARG=2000
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111

cd docker_setup
docker-compose -f docker-compose-dev.yml up -d

if necessary, follow the instructions to load data into the Mongo database from Restore Mongo Backup section of README in ./node-graphql

# Stop docker without 

docker-compose stop

Note: Using docker-compose down will cause the mongo database to be cleared

# Verify Mongo database

## Method 1

With the docker containers running, navigate to http://localhost:9100/graphql

You should see a graphql test UI.

In the left hand side, enter:

query {
  getHistorySceneFieldAggregation(fieldName:"eval")
}

The following indicates an empty database:

{
  "data": {
    "getHistorySceneFieldAggregation": []
  }
}

## Method 2

  Make sure the docker containers running 
  In a terminal, type: docker exec -it mcs-mongo bash
  Type (replace <user> and <password> with mongo username and password): mongo -u <user> --authenticationDatabase mcs -p <password>
  Type: use mcs
  Type: db.mcs_history.find().count()
  Verify the result.  If it is 0, the database is not loaded.
  Type: db.mcs_scenes.find().count()
  Verify the result.  If it is 0, the database is not loaded.

# Useful Mongo Queries

## List all evals:

  db.mcs_history.distinct( "eval");

or 

  db.mcs_scenes.distinct( "eval");

## With the eval name know, you can count how many scenes or history with:

  db.mcs_scenes.find({"eval":"<evalName>"}).count()
  db.mcs_history.find({"eval":"<evalName>"}).count()



