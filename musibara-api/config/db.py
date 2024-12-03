import dotenv
import os
import psycopg2
from psycopg2 import pool
import threading
import time

dotenv.load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

# def get_db_connection():
#     return psycopg2.connect(
#         dbname=DB_NAME,
#         user=DB_USER,
#         password=DB_PASS,
#         host=DB_HOST,
#         port='5432'
#     )

db_pool = psycopg2.pool.ThreadedConnectionPool(
    1, 10,  # minconn, maxconn
    user=DB_USER,
    password=DB_PASS,
    host=DB_HOST,
    port='5432',
    database=DB_NAME
)


DATABASE_IDLE_TIMEOUT = 30  #seconds
connection_last_used = {}
connection_last_used_lock = threading.Lock()


def get_db_connection():
    try:
        conn = db_pool.getconn()
        if conn:
            with connection_last_used_lock:
                connection_last_used[conn] = time.time()
            return conn
        else:
            raise Exception("Unable to obtain a connection from the pool.")
    except Exception as e:
        print(f"Error obtaining connection: {e}")
        raise


def release_db_connection(conn):
    try:
        if conn and conn in connection_last_used:
            with connection_last_used_lock:
                db_pool.putconn(conn)
                connection_last_used.pop(conn, None)
    except Exception as e:
        print(f"Error releasing connection: {e}")
        raise


def close_idle_connections():
    while True:
        time.sleep(DATABASE_IDLE_TIMEOUT)
        current_time = time.time()
        
        with connection_last_used_lock:
            for conn, last_used in list(connection_last_used.items()):
                if current_time - last_used > DATABASE_IDLE_TIMEOUT:
                    release_db_connection(conn)
        print("Idle connection check completed.")
