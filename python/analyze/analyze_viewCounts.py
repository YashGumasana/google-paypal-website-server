import os
import sys
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from bson import ObjectId
import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

# database connection
db_url = os.getenv('LOCAL_DB_URL')
db_name = os.getenv('DB_NAME')
api_key = os.getenv('GOOGLE_API_KEY')  
mongo_client = MongoClient(db_url)
db = mongo_client[db_name]
reports_collection = db['reports']


try:

    createdBy=sys.argv[1]
    channelId=sys.argv[2]
    reportId=sys.argv[3]
    url = f"https://www.googleapis.com/youtube/v3/channels?key={api_key}&id={channelId}&part=statistics"

        # Make the API request
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        statistics = data['items'][0]['statistics']
        viewCount = statistics.get('viewCount', '0')
        subscriberCount = statistics.get('subscriberCount', '0')
        hiddenSubscriberCount = statistics.get('hiddenSubscriberCount', False)
        videoCount = statistics.get('videoCount', '0')

        print("Channel Statistics:")
        print(f"Subscribers: {statistics['subscriberCount']}")
        print(f"Views: {statistics['viewCount']}")
        print(f"Videos: {statistics['videoCount']}")

        reports_collection.update_one(
            {'_id': ObjectId(reportId)},
            {'$set': {
                'channelId':channelId,
                'createdBy':createdBy, 
                'reports':True,
                'last_report_date': datetime.datetime.now(),
                'statistics': {
                    'viewCount': viewCount,
                    'subscriberCount': subscriberCount,
                    'hiddenSubscriberCount': hiddenSubscriberCount,
                    'videoCount': videoCount
                } 
            }},
            upsert=False
        )
        print('update success')

    else:
        print("error Failed to update channel statistics:", response.status_code)

# URL for the YouTube Data API request
        


except Exception as e:
    print("error:", str(e))  

