from typing import List 
import random
from faker import Faker
from typing import Dict, List

######## CREATE POSTS ###################################################################
def create_posts(opened_file, num_posts: int, users: List[str]):
    fake = Faker()
    post_data = []
    for _ in range(num_posts):
        userid = random.choice(users)
        content = fake.text(max_nb_chars=200)  
        likescount = 1

        post_data.append(f"({userid}, '{content}', {likescount})")

    insert_posts_string = f"""
INSERT INTO public.posts (userid, content, likescount) VALUES 
{', '.join(post_data)};
"""
    
    print(insert_posts_string, file=opened_file)
    print(f"{num_posts} random posts written")
    
