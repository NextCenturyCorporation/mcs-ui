# mcs-ui
UI Applications for MCS

# Running from docker

1. Verify that node-graphql/account-configs.js exists.  If it does not, ask a team member for a copy

2. Run the following:
```bash
docker build --tag node-graphql node-graphql/.
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111
docker build --tag analysis-ui analysis-ui/.
docker build --tag analysis-ui-staging analysis-ui/. --build-arg PORT_ARG=2000

cd docker_setup
docker-compose -f docker-compose-dev.yml up -d
```

if necessary, follow the instructions to load data into the Mongo database from Restore Mongo Backup section of ./node-graphql/README.md

# Verify Mongo database

## Method 1

With the docker containers running, navigate to http://localhost:9100/graphql

You should see a graphql test UI.

In the left hand side, enter:

```
query {
  getHistorySceneFieldAggregation(fieldName:"eval")
}
```

The following indicates an empty database:
```
{
  "data": {
    "getHistorySceneFieldAggregation": []
  }
}
```

## Method 2

  1. Make sure the docker containers running 
  2. Run the following, replacing <user> and <password> with mongo username and password):
  ```bash
  docker exec -it mcs-mongo bash
  mongo -u <user> --authenticationDatabase mcs -p <password>
  use mcs
  db.mcs_history.find().count()
  db.mcs_scenes.find().count()
  ```
  Verify the result of the last two commands are 0.  If they are not, the database is not loaded.

# Stop docker without losing data

```bash
docker-compose stop
```

Note: Using docker-compose down will cause the mongo database to be cleared

# Useful Mongo Queries

Be sure to update any values wrapped in < > below

## List all evals:
```
db.mcs_history.distinct( "eval");
db.mcs_scenes.distinct( "eval");
```

## With the eval name know, you can count how many scenes or history with:

```
db.mcs_scenes.find({"eval":"<evalName>"}).count()
db.mcs_history.find({"eval":"<evalName>"}).count()
```

## Find one entry of a certain eval:

```
db.mcs_history.findOne({"eval": "<eval>" })
```  
  
## Find one entry of a certain eval:

```
db.mcs_history.find({"eval": "<eval>" })
```

## Acknowledgements

This material is based upon work supported by the Defense Advanced Research Projects Agency (DARPA) and Naval Information Warfare Center, Pacific (NIWC Pacific) under Contract No. N6600119C4030. Any opinions, findings and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the DARPA or NIWC Pacific.