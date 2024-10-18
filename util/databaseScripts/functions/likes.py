import random 
from typing import List, Tuple

# Tuple(post_id, like_count)
def create_users_likes( opened_file, posts_likes: List[Tuple[int, int]], users: List[int]):
    number_of_likes = 0
    user_likes_params = []
    for post_id, like_count in posts_likes:
        for _ in range(like_count):
            number_of_likes +=1
            user = random.choice(users)
            user_likes_params.append(f'({post_id}, {user})')
        
    users_likes_query = f"""
    INSERT INTO postlikes (postid, userid) VALUES 
    {', '.join(user_likes_params)};
    """


 

 
    print(users_likes_query, file=opened_file)
    print(f'Added {number_of_likes} likes')
