from typing import Annotated
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from services.s3bucket_images import run_threaded_garbage_collector
from config.db import close_idle_connections
import threading
import musicbrainzngs
import dotenv
import os

dotenv.load_dotenv()

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

tags_metadata = [
     {
        "name": "Users",
        "description": "Endpoints for managing user accounts, including authentication (login/logout), profile management, and user settings. Also supports user registration and linking with external music streaming services.",
    },
    {
        "name": "Posts",
        "description": "Endpoints for creating, retrieving, updating, and interacting with posts. Includes functionality for commenting, liking, unliking posts, and managing post content (e.g., text, multimedia).",
    },
    {
        "name": "Herds",
        "description": "Endpoints for managing herds (groups of users). Allows users to create, join, and leave herds, as well as view herd-specific posts and playlists. Herds facilitate group-based music discussions and activities.",
    },
    {
        "name": "Songs",
        "description": "Endpoints for searching and saving songs. Supports adding songs to playlists, saving them to user collections, and searching songs by name or other attributes.",
    },
    {
        "name": "Artists",
        "description": "Endpoints for managing artist profiles, including the ability to search for artists, save them, and retrieve information about their music catalog and collaborations.",
    },
    {
        "name": "Albums",
        "description": "Endpoints for managing albums, including the ability to search, save, and retrieve album information. Supports album-based organization of songs and tracks.",
    },
    {
        "name": "Content",
        "description": "Endpoints for serving multimedia content and interactive data, such as posts, tags, and feeds. Includes the ability to view tag information, personalized homebars, and notifications.",
    },
    {
        "name": "Playlists",
        "description": "Endpoints for creating, deleting, and managing playlists. Includes features for adding/removing songs, searching playlists, and organizing music into custom collections.",
    },
    {
        "name": "Search-Bar",
        "description": "Endpoints that support search functionality across various content types, including posts, users, songs, albums, artists, and tags. Enables users to discover and explore music-related content on the platform.",
    },
]

description = """
- Facilitates classic social media features

- Supports collaboration and sharing through “herds,” which are groups that come together to discuss music by creating shared playlists and participating in group music reviews

- Allows users to explore music through Post Tags, traditional and non-traditional descriptors including genre, lyrical themes, abstract moods, and more

- Enables importing/exporting of playlists to and from as many streaming platforms as possible, with minimal inconsistencies (e.g. correct song name but wrong artist) by providing a common format for representing songs, playlists, artists, etc

"""
app = FastAPI(
    title="Musibara API",
    description=description,
    summary="This API powers Musibara.com",
    version="0.1.0",
    openapi_tags=tags_metadata,
)
app.include_router(router)


'''
Enable CORSMiddleware

Note: This will need to be changed in the future
        once we get AWS up and going.
'''

ORIGIN = [f"https://{origin.strip()}" if not origin.startswith(("https", "http")) else origin.strip() for origin in os.getenv("ORIGIN").split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGIN,
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"],
)

image_garbage_collector = threading.Thread(target=run_threaded_garbage_collector, daemon=True)
image_garbage_collector.start()
print("Image garbage collector has started")


idle_monitor_thread = threading.Thread(target=close_idle_connections, daemon=True)
idle_monitor_thread.start()
print("Idle connections garbage collector has started")