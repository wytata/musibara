from typing import List 
import random
from faker import Faker
from typing import List

def create_posts(opened_file, num_posts: int, users: List[str], users_herds: Dict[int, List[int]]):
    fake = Faker()
    post_data = []
    postid = 0
    for _ in range(num_posts):
        userid = random.choice(users)
        herdid = random.choice(users_herds[userid])
        content = fake.text(max_nb_chars=50)  
        likescount = 0
        commentcount = 0
        url = "www.provider/path/to/our/pictures"
        postid+=1
        herdid = random.choice([0, herdid])
        post_data.append(f"( {postid}, {userid}, '{content}', {likescount}, {commentcount}, '{url}', {herdid})")

    insert_posts_string = f"""
    INSERT INTO posts (postid, userid, content, likescount, commentcount, url, herdid) VALUES 
    {', '.join(post_data)};
    """
    
    print(insert_posts_string, file=opened_file)
    print(f"{num_posts} random posts written")
    
