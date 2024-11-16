import jwt
import time
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from dotenv import load_dotenv
import os

load_dotenv()
iss = os.getenv("APPLE_TEAM_ID")
kid = os.getenv("KID")

ALGO = "ES256"
SECRET_PATH = './../../../AuthKey_RQ6BT32HX4.p8'

def load_private_key():
    with open(SECRET_PATH, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )
    return private_key

def main():
    iat = int(time.time())
    exp = iat + 15776999
    secret = load_private_key()
    try:
        encoded_jwt = jwt.encode(
            {
                "iss": iss,
                "iat": iat,
                "exp": exp
            }, 
            secret,
            algorithm=ALGO,
            headers={
                "alg": ALGO,
                "kid": kid
                }
        )
        
        print(encoded_jwt)

        #decoded = jwt.decode(
        #    encoded_jwt,
        #    secret, 
        #    algorithms=[ALGO]
        #)

    except Exception as e:
        print(f"ERROR with jwt token: {e}")

if __name__ == "__main__":
    main()

