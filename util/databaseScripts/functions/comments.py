import random 
from typing import List, Tuple

# Tuple(post_id, comment_count)
def create_users_comments( opened_file, posts_comments: List[Tuple[int, int]], users: List[int]):
    number_of_comments= 0
    user_comments_params = []
    for post_id, comment_count in posts_comments:
        for _ in range(comment_count):
            number_of_comments +=1
            user = random.choice(users)
            user_comments_params.append(f'({post_id}, {user})')
        
    users_comments_query = f"""
    INSERT INTO postlikes (postid, userid) VALUES 
    {', '.join(user_comments_params)};
    """


 

 
    print(users_comments_query, file=opened_file)
    print(f'Added {number_of_comments} comments')
