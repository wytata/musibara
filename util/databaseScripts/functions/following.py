from typing import List
import random

def follow_users(opened_file, users: List[int]):
    params = []
    followed_count = 0
    for user_id in users:
        following_count = random.randint(0, len(users))

        followed_users = set()

        for _ in range(following_count):
            user = random.choice(users)
            while user in followed_users:
                user = random.choice(users)
            followed_users.add(user)
            params.append(f"({user_id}, {user})")
            followed_count +=1

        
          
        
    following_query = f"""
    INSERT INTO follows (userid, followingid) VALUES 
    {', '.join(params)};
    """
    
    print(following_query, file=opened_file)
    print(f'Users followed {followed_count} times')

