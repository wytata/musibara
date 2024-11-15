import random 
from typing import List, Tuple

# Tuple(comment_id, like_count)
def create_comment_likes( opened_file, comment_likes: List[Tuple[int, int]], users: List[int]):
    number_of_likes = 0
    user_likes_params = []
    for comment_id, like_count in comment_likes:
        likes_for_comment = set()
        for _ in range(like_count):
            number_of_likes +=1
            user = random.choice(users)
            while user in likes_for_comment:
                user = random.choice(users)
            user_likes_params.append(f'({comment_id}, {user})')
            likes_for_comment.add(user)
        
    users_likes_query = f"""
    INSERT INTO postcommentlikes (postcommentid, userid) VALUES 
    {', '.join(user_likes_params)};
    """


 

 
    print(users_likes_query, file=opened_file)
    print(f'Added {number_of_likes} comment likes')
