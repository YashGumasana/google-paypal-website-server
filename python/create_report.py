import os
import sys
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
mongo_client = MongoClient(db_url)
db = mongo_client[db_name]
users_collection = db['users']
reports_collection = db['reports']

try:
    # get user_id and report_id
    user_id = sys.argv[1]  
    report_id = sys.argv[2]  

    # Initialize the YouTube API and get access token and refresh token
    SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
    CLIENT_SECRETS_FILE = os.path.join(os.getcwd(), 'python', 'CLIENT.json')
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    credentials = flow.run_local_server()
    youtube_service = build('youtube', 'v3', credentials=credentials)

    # Store access and refresh token in user model
    access_token = credentials.token
    refresh_token = credentials.refresh_token
    print(access_token,'++++++++')
    print(refresh_token,'-------')
    users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'userYoutubeRefreshToken': refresh_token,
            'userYoutubeAccessToken': access_token
            }
        },
        upsert=False
    )

    # Get ID of the user's YouTube channel
    responseId = youtube_service.channels().list(part='id', mine=True).execute()
    channel_id = responseId['items'][0]['id']

    # Get channel statistics
    channel_response = youtube_service.channels().list(part='statistics', id=channel_id).execute()
    statistics = channel_response['items'][0]['statistics']

    # Update report with statistics
    viewCount = statistics.get('viewCount', '0')
    subscriberCount = statistics.get('subscriberCount', '0')
    hiddenSubscriberCount = statistics.get('hiddenSubscriberCount', False)
    videoCount = statistics.get('videoCount', '0')

    reports_collection.update_one(
        {'_id': ObjectId(report_id)},
        {'$set': {
            'channelId':channel_id,
            'createdBy': ObjectId(user_id),
            'reports': True,
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

    print("success")

except Exception as e:
    print("error:", str(e))









# mongo_client = MongoClient('mongodb://localhost:27017/')
# db = mongo_client['your_database_name']