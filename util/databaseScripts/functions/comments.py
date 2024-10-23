import random 
from typing import List, Tuple, TypedDict

class Info(TypedDict):
    parent_id_comment: str | None
    post_id: str
    user: str 
    content: str 

# Tuple(post_id, comment_count)
def create_users_comments( opened_file, posts_comments: List[Tuple[int, int]], users: List[int]):
    comments_id= 0
    user_comments_params = []
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

        
        for key, value in comment_info_collection.items():
            parent_id = value["parent_id_comment"]
            if parent_id is None:
                parent_id = "NULL"

            user_comments_params.append(f'({key}, {parent_id}, {value["post_id"]}, {value["user"]}, \'{value["content"]}\')')

        
          
        
    users_comments_query = f"""
    INSERT INTO postcomments (postcommentid, parentcommentid, postid, userid, content) VALUES 
    {', '.join(user_comments_params)};
    """


 

 
    print(users_comments_query, file=opened_file)
    print(f'Added {comments_id} comments')
