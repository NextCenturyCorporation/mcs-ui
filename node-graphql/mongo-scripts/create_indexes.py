from pymongo import MongoClient

def main():
    client = MongoClient(
        'mongodb://mongomcs:mongomcspassword@localhost:27017/mcs')
    mongoDB = client['mcs']
    create_new_performance_indexes(mongoDB)
    print('ALL DONE!')

def create_new_performance_indexes(mongoDB):
    collection_numbers = ["2", "3_5", "3_75", "4"]

    for eval_number in collection_numbers:
        # results collections
        results_collection = mongoDB["eval_" + eval_number + "_results"]

        result = results_collection.create_index([
            ("name", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("performer", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("test_type", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("category", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("cat_type_pair", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("score.score", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("score.description", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("metadata", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("test_num", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("test_type", 1), ("category", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("test_type", 1), ("metadata", 1)
        ])

        print("Index creation result: ", result)

        result = results_collection.create_index([
            ("eval", 1)
        ])

        print("Index creation result: ", result)

        # scenes
        scenes_collection = mongoDB["eval_" + eval_number + "_scenes"]

        result = scenes_collection.create_index([
            ("name", 1)
        ])

        print("Index creation result: ", result)



if __name__ == "__main__":
    main()
