from pymongo import MongoClient
from bson.objectid import ObjectId
from bson import Code
import os
import sys

SCENE_INDEX = "mcs_scenes"
HISTORY_INDEX = "mcs_history"
KEYS_INDEX = "collection_keys"

client = MongoClient('mongodb://mongomcs:mongomcspassword@mcs-mongo:27017/mcs')
mongoDB = client['mcs']

def create_csv_file(db_index, eval_name):
    print("Begin Processing " + db_index)
    sys.stdout.flush()
    collection = mongoDB[KEYS_INDEX]

    keys_doc = collection.find({"name": eval_name})
    keys_file = eval_name.replace(" ", "_") + "_keys.txt"
    
    f = open(keys_file, 'w')
    for doc in keys_doc:
        for key in doc["keys"]:
            f.write(key + "\n")
    f.close()

    print("Text file with fields created.")
    sys.stdout.flush()

    csv_file_name = eval_name.replace(" ", "_") + ".csv"
    os.system("mongoexport --host mcs-mongo:27017 -u mongomcs --authenticationDatabase mcs -p mongomcspassword -c " + 
         db_index + " --type=csv --out=" + csv_file_name + " --fieldFile=" + keys_file + " -d mcs --query=\"{'eval': '" + eval_name + "'}\"")
    
    print("CSV file created.")
    sys.stdout.flush()


def main():
    # First agument is the index (scene or history)
    # Second argument is eval name
    create_csv_file(sys.argv[1], sys.argv[2])


if __name__ == "__main__":
    main()