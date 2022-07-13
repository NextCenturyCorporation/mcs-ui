# mcs-ui
UI Applications for MCS. 

#### ***If this is your first time setting up the repository go to the section: [UI Setup](#ui-setup)***

# Running from docker

```
docker build --tag node-graphql node-graphql/.
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111
docker build --tag analysis-ui analysis-ui/.
docker build --tag analysis-ui-staging analysis-ui/. --build-arg PORT_ARG=2000

cd docker_setup
docker-compose -f docker-compose-dev.yml up -d
```

# Running from docker with npm start (Optional)

This setup will enable auto updating and refreshing whenever an analysis-ui component is changed and saved with having to run docker-compose after every saved change.

### Setup
1. Copy `config.js` from analysis-ui/public/configs/dev
2. Paste `config.js` in analysis-ui/src/services
3. Run `npm install` in analysis-ui/

### Running
1. Run `docker-compose -f docker-compose-dev.yml up -d` inside docker_setup/
2. Run `docker stop analysis-ui`
3. Inside the analysis-ui/ directory run `npm start`

# UI Setup

### 1: Download Tars from S3

Navigate to https://s3.console.aws.amazon.com/s3/buckets/mongo-backup-tars?region=us-east-1&tab=objects then download `mongo_backup.tar.gz` and `backup.tar`.
Place both inside on the mcs-ui/node-graphl/ directory.

### 2: Create UI
Verify that node-graphql/account-configs.js exists. Ask a team member for a copy if it does not.

```
docker build --tag node-graphql node-graphql/.
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111
docker build --tag analysis-ui analysis-ui/.
docker build --tag analysis-ui-staging analysis-ui/. --build-arg PORT_ARG=2000

cd docker_setup
docker-compose -f docker-compose-dev.yml up -d
```


### 3: Copy Mongo Base Collections Backup Tar

`mongo_backup.tar.gz` contains the base collections needed for the app to function.
cd to the `node-graphql` directory.

```
cd ../node-graphql/
docker cp mongo_backup.tar.gz mcs-mongo:mongo_backup.tar.gz
docker exec -it mcs-mongo bash
gunzip -c mongo_backup.tar.gz | tar xopf -
mongorestore -u mongomcs --authenticationDatabase mcs -p mongomcspassword -d mcs ./data_con/mcs
```

### 4: Copy Scenes and Results Backup Tar
`backup.tar` contains the scenes and results data.
`exit` the bash to copy the backup.

```
exit
docker cp backup.tar mcs-mongo:backup.tar
docker exec -it mcs-mongo bash
tar -xvf backup.tar
```

### 5: Import the Scenes and Results

Stay inside the bash for this.

```
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_2_scenes --file=eval_2_scenes.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_scenes --file=eval_3_scenes.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_5_scenes --file=eval_3_5_scenes.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_75_scenes --file=eval_3_75_scenes.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_4_scenes --file=eval_4_scenes.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_2_results --file=eval_2_results.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_results --file=eval_3_results.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_5_results --file=eval_3_5_results.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_3_75_results --file=eval_3_75_results.json
mongoimport --uri "mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs" -c eval_4_results --file=eval_4_results.json
```

### 6: Create Indexes from mcs-ingest 

mcs-ui/node-graphql/mongo-scripts contains `create_indexes.py`. In a seperate terminal clone the mcs-ingest repository (https://github.com/NextCenturyCorporation/mcs-ingest) and setup its virtual environment. Then copy and paste `create_indexes.py` into the mcs-ingest root directory and run `python create_indexes.py` from the root directory.
This makes loading UI scenes and results significantly faster.

### 7: Rebuild UI

`exit` the mongo bash in your UI terminal and cd to the root `mcs-ui` directory to rebuild.

```
exit
cd ../docker_setup/
docker-compose -f docker-compose-dev.yml up -d
```

### 8: Complete 

Navigate to http://localhost:3000/login in a web browser. You should see the login page. Login or create an account. Then you should see charts within a 30 seconds. If you see charts you are done. If it takes over minute then make sure step 6 worked. You can now implement the **optional** [running from docker with npm start](#running-from-docker-with-npm-start-optional)



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