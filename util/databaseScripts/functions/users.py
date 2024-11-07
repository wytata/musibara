from faker import Faker
import random

def create_users(opened_file, number_of_users:int, pic_id):
    fake = Faker()
    users = []
    user_data = []
    for userid in range(number_of_users):
        name = fake.name()
        bio = fake.text(max_nb_chars=30)
        biolink = "https://en.wikipedia.org/wiki/Peanut_(squirrel)"
        password = fake.password()
        username = fake.user_name()
        users.append(userid)
        user_data.append(f"( {userid},'{username}', '{name}', '{bio}', '{biolink}', '{password}', {pic_id}, {pic_id})") 

    insert_users_string = f"""
INSERT INTO users (userid, username, name, bio, biolink, password, profilephoto, bannerphoto) VALUES 
{', '.join(user_data)};
"""
    
    print(insert_users_string, file=opened_file)
    print(f'User data for {number_of_users} users written')

    return users

