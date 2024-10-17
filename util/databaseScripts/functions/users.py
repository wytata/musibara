from faker import Faker
import random

def create_users(opened_file):
    fake = Faker()
    
    users = []
    user_data = []
    for userid in range(10):
        name = fake.name()
        password = fake.password()
        username = fake.user_name()
        users.append(userid)
        user_data.append(f"( {userid},'{username}', '{name}', '{password}')") 

    insert_users_string = f"""
INSERT INTO users (userid, username, name, password) VALUES 
{', '.join(user_data)};
"""
    
    print(insert_users_string, file=opened_file)
    print("User data for 10 users written")

    return users

