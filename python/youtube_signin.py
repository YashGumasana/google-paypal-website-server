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

try:
    # get user_id and report_id
    user_id = sys.argv[1]  

    # Initialize the YouTube API and get access token and refresh token
    SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
    CLIENT_SECRETS_FILE = os.path.join(os.getcwd(), 'python', 'CLIENT.json')
    print('CLIENT_SECRETS_FILE',CLIENT_SECRETS_FILE)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    credentials = flow.run_local_server()
    youtube_service = build('youtube', 'v3', credentials=credentials)

    # Store access and refresh token in user model
    access_token = credentials.token
    refresh_token = credentials.refresh_token
     # Get ID of the user's YouTube channel
    responseId = youtube_service.channels().list(part='id', mine=True).execute()
    responseTitle = youtube_service.channels().list(part='snippet', mine=True).execute()

    channel_id = responseId['items'][0]['id']
    channel_title = responseTitle['items'][0]['snippet']['title']

    # print('access_token',access_token)
    # print('refresh_token',refresh_token)
    res=None
    if refresh_token:
        res=users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'userYoutubeRefreshToken': refresh_token,
                'userYoutubeAccessToken': access_token,
                'channelTitle': channel_title,
                'channelId': channel_id,
                'isYoutubeSignIn': True
                }
            },
            upsert=False
        )
    else:
        res=users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'userYoutubeAccessToken': access_token,
                'channelTitle': channel_title,
                'channelId': channel_id,
                'isYoutubeSignIn': True

                }
            },
            upsert=False
        )


    if res.matched_count == 0:
        print("No document matched for update.")
    else:
        print(f"Document updated successfully. Matched {res.matched_count} documents.")
    print(res)

except Exception as e:
    print("error:", str(e))