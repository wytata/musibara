from typing import Annotated
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from services.s3bucket_images import run_threaded_garbage_collector
import threading
import musicbrainzngs

musicbrainzngs.set_useragent(
    "musibara-musicbrainz-agent",
    "0.1",
    "https://placeholder.com"
)

image_garbage_collector = threading.Thread(target=run_threaded_garbage_collector, daemon=True)
image_garbage_collector.start()
print("Image garbage collector has started")

app = FastAPI()
app.include_router(router)


'''
Enable CORSMiddleware

Note: This will need to be changed in the future
        once we get AWS up and going.
'''
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"],
    #allow_headers = ["*"]
)

