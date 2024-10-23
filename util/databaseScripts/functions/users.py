from faker import Faker
import random

def create_users(opened_file, number_of_users:int):
    fake = Faker()
    
    users = []
    user_data = []
    for userid in range(number_of_users):
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
    print(f'User data for {number_of_users} users written')

    return users

