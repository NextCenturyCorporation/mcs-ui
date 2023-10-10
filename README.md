# mcs-ui
UI Applications for MCS. 

#### ***If this is your first time setting up the repository go to the section: [UI Setup](#ui-setup)***

# Running from docker

```
docker build --tag node-graphql node-graphql/.
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111

NOTE: IF you are on a MAC with a M1 CHIP you need to build the graphql end points with these commands:
docker build --tag node-graphql node-graphql/. --build-arg BUILD_ENV=ARM
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111 --build-arg BUILD_ENV=ARM

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
3. Run `npm install` in analysis-ui/ (may need to run with `--force`)

### Running
1. Run `docker-compose -f docker-compose-dev.yml up -d` inside docker_setup/
2. Run `docker stop analysis-ui`
3. Inside the analysis-ui/ directory run `npm start` (Note: if this step fails, you may need to run `export NODE_OPTIONS=--openssl-legacy-provider`, then retry)

# UI Setup

### 1: Preparation

- Download `data_con_backup_all.tar.gz` from mcs-ui EC2 instance. These instructions assume the tar is in the `mcs-ui/node-graphql/` directory. You might need the UI PEM file; get it from the AWS Secrets Manager dashboard.
- Get a copy of `account-configs.js` from a teammate and put it in the `mcs-ui/node-graphql` directory.

### 2: Create and Launch UI

```
docker build --tag node-graphql node-graphql/.
docker build --tag node-graphql-staging node-graphql/. --build-arg PORT_ARG=9111
docker build --tag analysis-ui analysis-ui/.
docker build --tag analysis-ui-staging analysis-ui/. --build-arg PORT_ARG=2000

cd docker_setup
docker-compose -f docker-compose-dev.yml up -d
```

### 3: Copy Mongo Base Collections Backup Tar

`data_con_backup_all.tar.gz` contains the base collections needed for the app to function,
as well as scene + result collections.
cd to the `node-graphql` directory.

```
cd ../node-graphql/
docker cp data_con_backup_all.tar.gz mcs-mongo:data_con_backup_all.tar.gz
docker exec -it mcs-mongo bash
gunzip -c data_con_backup_all.tar.gz | tar xopf -
# Unzip and import necessary collections
gunzip -c data_con_backup_except_eval.tar.gz | tar xopf -
mongorestore -u mongomcs --authenticationDatabase mcs -p mongomcspassword -d mcs ./data_con_except_eval/mcs
# Then download whichever collections you'd like to have locally
gunzip -c data_con_backup_scenes_<eval_num>.tar.gz | tar xopf -
gunzip -c data_con_backup_results_<eval_num>.tar.gz | tar xopf -
mongorestore -u mongomcs --authenticationDatabase mcs -p mongomcspassword -d mcs ./data_con_scenes_<eval_num>/mcs
mongorestore -u mongomcs --authenticationDatabase mcs -p mongomcspassword -d mcs ./data_con_results_<eval_num>/mcs
```

### 4: Rebuild UI

`exit` the mongo bash in your UI terminal and cd to the root `mcs-ui` directory to rebuild.

```
exit
cd ../docker_setup/
docker-compose -f docker-compose-dev.yml up -d
```

### 5: Complete 

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
  # Note: if running Mongo 6+, legacy shell is no longer included -- you
  # will need to reference `/usr/bin/mongosh` instead of `mongo` at the
  # beginning
  mongo -u <user> --authenticationDatabase mcs -p <password>
  use mcs
  # Replace <eval_num> with whatever collection(s) you've loaded
  db.eval_<eval_num>_results.find().count()
  db.eval_<eval_num>_scenes.find().count()

  ```
  Verify the result of the last two commands are 0.  If they are not, the database is not loaded.

# Stop docker without losing data

```bash
docker-compose stop
```

Note: Using docker-compose down will cause the mongo database to be cleared

# Useful Mongo Queries

Be sure to update any values wrapped in < > below


## Count how many scenes or history with:

```
db.eval_<eval_num>_scenes.count()
db.eval_<eval_num>_results.count()
```

## Find one entry of a certain eval:

```
db.eval_<eval_num>_scenes.findOne()
```  
  
## Find one entry of a certain eval:

```
db.eval_<eval_num>_results.find()
```

# Manual Data Manipulation

## Ingest

First, start your Mongo database and UI. Next, put your scene files in one folder and their corresponding history files in a second folder. Then, from the [mcs-ingest](https://github.com/NextCenturyCorporation/mcs-ingest) repository, activate your python virtual environment and run the following scripts:

```
python local_scene_ingest.py --folder <scene_folder>
python local_history_ingest.py --folder <history_folder>
```

You may also need to run `update_collection_keys_if_missing.py` afterward:

```
cd <mcs-ingest>
cp scripts/update_collection_keys_if_missing.py .
python update_collection_keys_if_missing.py eval_6_scenes "Evaluation 6 Scenes"
python update_collection_keys_if_missing.py eval_6_results "Evaluation 6 Results"
```

## Delete

1. Install the Mongo CLI with (on Linux) `sudo apt-get install mongodb`
2. Start the Mongo Shell with `mongo`
3. Run `use_mcs`, then `db.auth(username, password)` (with the correct Mongo MCS username and password -- refer to your `mcs-ui/node-graphql/account-configs.js` file)
4. To see your collections: `show collections`
5. To delete a collection (like "eval_x_scenes"): `db.eval_x_scenes.drop()`

# Acknowledgements

This material is based upon work supported by the Defense Advanced Research Projects Agency (DARPA) and Naval Information Warfare Center, Pacific (NIWC Pacific) under Contract No. N6600119C4030. Any opinions, findings and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the DARPA or NIWC Pacific.
