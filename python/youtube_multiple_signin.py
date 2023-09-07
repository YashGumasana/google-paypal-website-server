# print("Hello")
# import os
# import sys
# print(sys.executable)
# from pymongo import MongoClient
# from google.oauth2.credentials import Credentials
# from bson import ObjectId
# from google_auth_oauthlib.flow import InstalledAppFlow
# from googleapiclient.discovery import build
# import datetime
# from dotenv import load_dotenv
# load_dotenv()

# # Database connection
# db_url = os.getenv('LOCAL_DB_URL')
# db_name = os.getenv('DB_NAME')
# mongo_client = MongoClient(db_url)
# db = mongo_client[db_name]
# users_collection = db['users']

# def update_user_channel_info(user_id, access_token, refresh_token, channel_id, channel_title):


#     existing_channel = users_collection.find_one({
#         '_id': ObjectId(user_id),
#         'youtubeChannels': {'$elemMatch': {'channelId': channel_id}}
#     })

#     if existing_channel:
        
#         return False 


#     channel_info = {
#         'userYoutubeAccessToken': access_token,
#         'userYoutubeRefreshToken': refresh_token,
#         'channelId': channel_id,
#         'channelTitle': channel_title,
#         'isUse': False
#     }


#     if refresh_token:
#         update_query = {
#             '$push': {
#                 'youtubeChannels': channel_info
#             },
#             '$set': {
#                 'isYoutubeSignIn': True
#             }
#         }
#     else:
#         update_query = {
#             '$push': {
#                 'youtubeChannels': {
#                     'userYoutubeAccessToken': access_token,
#                     'channelId': channel_id,
#                     'channelTitle': channel_title,
#                     'isUse':False
#                 }
#             },
#             '$set': {
#                 'isYoutubeSignIn': True
#             }
#         }



#     res = users_collection.update_one(
#         {'_id': ObjectId(user_id)},
#         update_query,
#         upsert=False
#     )

#     if res:
#         return True

#     # res = users_collection.update_one(
#     #     {'_id': ObjectId(user_id)},
#     #     {'$push': {'youtube': channel_info}},
#     #     upsert=False
#     # )

#     # return res

# try:
#     user_id = sys.argv[1]
#     print("user_id",user_id)

#     # Initialize the YouTube API and get access token and refresh token
#     SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
#     CLIENT_SECRETS_FILE = os.path.join(os.getcwd(), 'python', 'CLIENT.json')
#     flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
#     credentials = flow.run_local_server()
#     youtube_service = build('youtube', 'v3', credentials=credentials)

#     # Get ID and title of the user's YouTube channels
#     channels_response = youtube_service.channels().list(part='id,snippet', mine=True).execute()
#     youtube_channels = channels_response.get('items', [])

#     if not youtube_channels:
#         print('No YouTube channels found for the user.')

#     for channel in youtube_channels:
#         channel_id = channel['id']
#         channel_title = channel['snippet']['title']

#         access_token = credentials.token
#         refresh_token = credentials.refresh_token

#         res = update_user_channel_info(user_id, access_token, refresh_token, channel_id, channel_title)

#         # if res.matched_count == 0:
#         if res:
#             print(f"document matched for channel {channel_title} update.")
#         else:
#             print(f"no document matched for channel {channel_title} update.")

# except Exception as e:
#     print("error:", str(e))

print("hello")
import os
import sys
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import socket
from bson import ObjectId
import datetime
from pymongo import MongoClient
import signal
import sys
import time
from dotenv import load_dotenv
load_dotenv()

# Database connection
db_url = os.getenv('LOCAL_DB_URL')
db_name = os.getenv('DB_NAME')
mongo_client = MongoClient(db_url)
db = mongo_client[db_name]
users_collection = db['users']

def update_user_channel_info(user_id, access_token, refresh_token, channel_id, channel_title):


    existing_channel = users_collection.find_one({
        '_id': ObjectId(user_id),
        'youtubeChannels': {'$elemMatch': {'channelId': channel_id}}
    })

    if existing_channel:
        return False 


    channel_info = {
        'userYoutubeAccessToken': access_token,
        'userYoutubeRefreshToken': refresh_token,
        'channelId': channel_id,
        'channelTitle': channel_title,
        'isUse': True
    }


    if refresh_token:
        update_query = {
            '$push': {
                'youtubeChannels': channel_info
            },
            '$set': {
                'isYoutubeSignIn': True
            }
        }
    else:
        update_query = {
            '$push': {
                'youtubeChannels': {
                    'userYoutubeAccessToken': access_token,
                    'channelId': channel_id,
                    'channelTitle': channel_title,
                    'isUse':True
                }
            },
            '$set': {
                'isYoutubeSignIn': True
            }
        }



    res = users_collection.update_one(
        {'_id': ObjectId(user_id)},
        update_query,
        upsert=False
    )

    return res

def find_available_port(start_port, max_attempts=10):
    for attempt in range(max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("127.0.0.1", start_port))
                return start_port
        except OSError as e:
            if attempt < max_attempts - 1:
                start_port += 1
            else:
                raise e 

def signal_handler(signal, frame):
    print("Received termination signal. Cleaning up and exiting...")
    # Add cleanup code here if needed
    sys.exit(0)

# Register a signal handler to handle termination gracefully
signal.signal(signal.SIGINT, signal_handler)

try:
    # user_id = sys.argv[1]
    # print("user_id",user_id)
    # Initialize the YouTube API and get access token and refresh token
    print("db_url",db_url)
    SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
    CLIENT_SECRETS_FILE = os.path.join(os.getcwd(), 'python', 'CLIENT.json')
    
    available_port = find_available_port(8080)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    credentials = flow.run_local_server(port=available_port)
    youtube_service = build('youtube', 'v3', credentials=credentials)

    # Get ID and title of the user's YouTube channels
    channels_response = youtube_service.channels().list(part='id,snippet', mine=True).execute()
    youtube_channels = channels_response.get('items', [])

    if not youtube_channels:
        print('No YouTube channels found for the user.')

    for channel in youtube_channels:
        channel_id = channel['id']
        channel_title = channel['snippet']['title']

        access_token = credentials.token
        refresh_token = credentials.refresh_token

        # res = update_user_channel_info(user_id, access_token, refresh_token, channel_id, channel_title)
        print("good")

        # if res.matched_count == 0:
        #     print(f"No document matched for channel {channel_title} update.")
        # else:
        #     print(f"Document updated successfully for channel {channel_title}. Matched {res.matched_count} documents.")

except Exception as e:
    print("error:", str(e))
