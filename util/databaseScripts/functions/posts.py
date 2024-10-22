from typing import List 
import random
from faker import Faker
from typing import List, Dict, Tuple

def create_posts(opened_file, num_posts: int, users: List[int], users_herds: Dict[int, List[int]]):
    fake = Faker()
    post_data = []
    post_data_no_herd = []
    postid = 0
    posts_comments: List[Tuple[int, int]] = []
    posts_likes: List[Tuple[int,int]] = []
    for _ in range(num_posts):
        userid = random.choice(users)
        herdid = random.choice(users_herds[userid])
        content = fake.text(max_nb_chars=50)  
        likescount = random.randint(0, len(users))
        commentcount = random.randint(0, len(users))
        url = "www.provider/path/to/our/pictures"
        postid+=1
        herdid = random.choice([0, herdid])
        posts_comments.append((postid, commentcount))
        posts_likes.append((postid, likescount))
        
        if herdid==0:
            post_data_no_herd.append(f"( {postid}, {userid}, '{content}', {likescount}, {commentcount}, '{url}')")
        
        else:
            post_data.append(f"( {postid}, {userid}, '{content}', {likescount}, {commentcount}, '{url}', {herdid})")

    insert_posts = f"""
    INSERT INTO posts (postid, userid, content, likescount, commentcount, url, herdid) VALUES 
    {', '.join(post_data)};
    """

    insert_posts_no_herd = f"""
    INSERT INTO posts (postid, userid, content, likescount, commentcount, url) VALUES 
    {', '.join(post_data_no_herd)};
    """
    
    print(insert_posts, file=opened_file)
    print(insert_posts_no_herd, file=opened_file)

    print(f"{num_posts} random posts written")

    return (posts_likes, posts_comments)
    