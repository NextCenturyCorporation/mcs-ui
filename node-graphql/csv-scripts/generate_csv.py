from pymongo import MongoClient
from bson.objectid import ObjectId
from bson import Code
import os
import sys
import boto3

EVALUATION_BUCKET = 'evaluation-images'
EVALUATION_PREFIX = 'csv-db-files/'
KEYS_INDEX = "collection_keys"

client = MongoClient('mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs')
mongoDB = client['mcs']


def upload_csv_file(csv_file_name):
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(EVALUATION_BUCKET)
    bucket.upload_file(Filename=csv_file_name, Key=EVALUATION_PREFIX + csv_file_name)


def create_csv_file(db_index, eval_name):
    collection = mongoDB[KEYS_INDEX]

    keys_doc = collection.find({"name": eval_name})
    keys_file = eval_name.replace(" ", "_") + "_keys.txt"
    
    f = open(keys_file, 'w')
    for doc in keys_doc:
        for key in doc["keys"]:
            f.write(key + "\n")
    f.close()

    csv_file_name = eval_name.replace(" ", "_") + ".csv"
    os.system("mongoexport --host mcs-mongo:27017 -u mongomcs " +
        "--authenticationDatabase mcs -p mongomcspassword -c " +
        db_index + " --type=csv --out=" + csv_file_name + " --fieldFile=" + 
        keys_file + " -d mcs --query=\"{'eval': '" + eval_name + "'}\"")

    upload_csv_file(csv_file_name)


def main():
    # First agument is the index (scene or history)
    # Second argument is eval name
    create_csv_file(sys.argv[1], sys.argv[2])


if __name__ == "__main__":
    main()