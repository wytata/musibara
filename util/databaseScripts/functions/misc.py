import psycopg2
import dotenv
import os
from faker import Faker
import random

dotenv.load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port='5432'
    )

def sync_follows():
    db = get_db_connection()
    cursor = db.cursor()
    update_query = """update users
    set followercount = (SELECT COUNT(*) FROM follows WHERE followingid = %s), 
    followingcount = (SELECT COUNT(*) FROM follows WHERE userid = %s)
    where userid = %s
    """
    try:
        for i in range(1, 111):
            cursor.execute(update_query, (i, i, i, ))
    except Exception as e:
        print(e)
    db.commit()

def randomize_post_titles():
    db = get_db_connection()
    cursor = db.cursor()
    
    try: 
        posts_query = "SELECT postid from posts"
        cursor.execute(posts_query)
        post_ids = [res[0] for res in cursor.fetchall()]

        faker = Faker()
        for post in post_ids:
            update_query = "UPDATE posts SET title = %s WHERE postid = %s"
            title = faker.sentence(nb_words=2)
            cursor.execute(update_query, (title, post, ))
    except Exception as e:
        print(e)
    db.commit()

def assign_tags_to_post():
    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM posttags")
        rows = cursor.fetchall()
        columnNames = [desc[0] for desc in cursor.description]
        post_tags = [dict(zip(columnNames, row)) for row in rows]
        for tag in post_tags:
            posts_query = "select postid from posts order by random() limit %s"
            cursor.execute(posts_query, (random.randint(1, 40), ))
            rows = cursor.fetchall()
            post_ids = [row[0] for row in rows]
            values = ", ".join(cursor.mogrify("(%s, %s, %s, %s)", (post_id, tag["resourcetype"], tag["mbid"], tag["name"])).decode("utf-8") for post_id in post_ids)
            insert_query = "INSERT INTO posttags VALUES " + values + " ON CONFLICT DO NOTHING"
            cursor.execute(insert_query)
    except Exception as e:
        print(e)
        
    db.commit()

assign_tags_to_post()
