import boto3
import dotenv
import os

dotenv.load_dotenv()

KEY = os.getenv("AWS_KEY")
SEC_KEY = os.getenv("AWS_SEC_KEY")
REGION = os.getenv("AWS_REGION")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")


def create_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=KEY,
        aws_secret_access_key=SEC_KEY,
        region_name=REGION
    )

def get_bucket_name():
    return BUCKET_NAME

def get_region():
    return REGION
