import random 
from typing import List, Tuple

# Tuple(post_id, like_count)
def create_users_likes( opened_file, posts_likes: List[Tuple[int, int]], users: List[int]):
    number_of_likes = 0
    user_likes_params = []
    for post_id, like_count in posts_likes:
        post_likes_set = set()
        for _ in range(like_count):
            number_of_likes +=1
            user = random.choice(users)
            while user in post_likes_set:
                user = random.choice(users)
            user_likes_params.append(f'({post_id}, {user})')
            post_likes_set.add(user)
        
    users_likes_query = f"""
    INSERT INTO postlikes (postid, userid) VALUES 
    {', '.join(user_likes_params)};
    """


 

 
    print(users_likes_query, file=opened_file)
    print(f'Added {number_of_likes} likes')
