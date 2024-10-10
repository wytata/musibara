
import random
from faker import Faker
from functions.db import db
######## CREATE POSTS ###################################################################
def create_posts(opened_file, num_posts=100):
    fake = Faker()

    cursor = db.cursor()

    cursor.execute("SELECT userid FROM public.users;")
    user_ids = [row[0] for row in cursor.fetchall()]

    post_data = []
    for _ in range(num_posts):
        userid = random.choice(user_ids)
        content = fake.text(max_nb_chars=200)  
        likescount = 1 
        post_data.append(f"({userid}, '{content}', {likescount})")

    insert_posts_string = f"""
INSERT INTO public.posts (userid, content, likescount) VALUES 
{', '.join(post_data)};
"""
    
    print(insert_posts_string, file=opened_file)
    print(f"{num_posts} random posts written")

    # Clean up
    cursor.close()
    conn.close()

