import psycopg2
import dotenv
import os

dotenv.load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

db = psycopg2.connect(f'dbname={DB_NAME} user={DB_USER} password={DB_PASS} host={DB_HOST}')
