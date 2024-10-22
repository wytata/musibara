import psycopg2
import dotenv
import os
import logging

logging.basicConfig(level=logging.DEBUG)

dotenv.load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
print("DB_USER:", DB_USER)
print("DB_PASS:", DB_PASS)
print("DB_HOST:", DB_HOST)
print("DB_NAME:", DB_NAME)

db = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port = '5432')

