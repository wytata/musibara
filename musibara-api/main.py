from typing import Annotated
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from services.s3bucket_images import run_threaded_garbage_collector
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
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

ORIGIN = os.getenv("ORIGIN").split(',')

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[ORIGIN],
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
#     allow_headers=["Access-Control-Allow-Headers", "Content-Type", "Authorization", "Access-Control-Allow-Origin", "Set-Cookie", "Access-Control-Allow-Credentials"],
#     #allow_headers = ["*"]
# )
ALLOWED_IPS = ['165.91.0.132', '127.0.0.1', 'http://localhost:3000']

class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get the origin header
        origin = request.headers.get('Origin')

        # Get the IP address from the request
        ip_address = request.client.host

        # Check if the IP is allowed
        if ip_address in ALLOWED_IPS:
            # If allowed IP, allow the request to proceed
            response = await call_next(request)
            
            # Set the CORS headers if 'Origin' is present
            if origin:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, HEAD, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Set-Cookie, Access-Control-Allow-Origin"
            
            return response
        else:
            # If the IP is not allowed, deny the request
            return Response("Forbidden", status_code=403)


# Add the custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

