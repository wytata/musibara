import random 
from typing import List, Tuple, TypedDict

class Info(TypedDict):
    parent_id_comment: str | None
    post_id: str
    user: str 
    content: str 

# Tuple(post_id, comment_count)
def create_users_comments( opened_file, posts_comments: List[Tuple[int, int]], users: List[int], likes_per_comment:int):
    comments_id= 0
    user_comments_params = []
    comments_id_collection = []
    for post_id, comment_count in posts_comments:
        if comment_count==0:
            continue

        parent_comments_count = random.randint(1, comment_count)
        
        comment_info_collection = {}
        for _ in range(parent_comments_count):
            comments_id +=1
            new_comment:Info = {
                "parent_id_comment": None,
                "post_id": str(post_id),
                "user": str(random.choice(users)),
                "content": f'THIS IS A PARENT COMMENT - id:{comments_id}'  

            }
            comment_info_collection[comments_id] = new_comment
            comments_id_collection.append((comments_id, likes_per_comment))

        for _ in range((comment_count - parent_comments_count)):
            random_id = random.choice(list(comment_info_collection.keys()))
            comments_id +=1
            new_comment:Info = {
                "parent_id_comment": random_id,
                "post_id": str(post_id),
                "user": str(random.choice(users)),
                "content": f'THIS IS A CHILD COMMENT- id:{comments_id} , parent_id: {random_id}'  
            }
            comment_info_collection[comments_id] = new_comment
            comments_id_collection.append((comments_id, likes_per_comment))
        
        for key, value in comment_info_collection.items():
            parent_id = value["parent_id_comment"]
            if parent_id is None:
                parent_id = "NULL"

            user_comments_params.append(f'({key}, {parent_id}, {value["post_id"]}, {value["user"]}, \'{value["content"]}\', {likes_per_comment+1})')

        
          
        
    users_comments_query = f"""
    INSERT INTO postcomments (postcommentid, parentcommentid, postid, userid, content, likescount) VALUES 
    {', '.join(user_comments_params)};
    """
    
    users_comments_query += f"SELECT setval('postcomments_postcommentid_seq', COALESCE(MAX(postcommentid), {likes_per_comment+1}), TRUE) FROM postcomments;"
 
    print(users_comments_query, file=opened_file)
    print(f'Added {comments_id} comments')

    return comments_id_collection
