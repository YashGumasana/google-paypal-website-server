import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
load_dotenv()

db_url = os.getenv('LOCAL_DB_URL')
db_name = os.getenv('DB_NAME')
mongo_client = MongoClient(db_url)
db = mongo_client[db_name]
users_collection = db['users']

try:
    user_id = sys.argv[1]  

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        user_token = user.get("userYoutubeAccessToken")
        if user_token:
            print("User token:", user_token)

            #Now We have the capability to perform various actions using this token.

        else:
            print("User token not found.")
    else:
        print("User not found.")

except Exception as e:
    print("error:", str(e))