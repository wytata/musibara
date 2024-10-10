from faker import Faker
import random

def create_users(opened_file):
    fake = Faker()

    user_data = []
    for _ in range(10):
        name = fake.name()
        password = fake.password()
        user_data.append(f"('{name}', '{password}')") 

    insert_users_string = f"""
INSERT INTO public.users (name, password) VALUES 
{', '.join(user_data)};
"""
    
    print(insert_users_string, file=opened_file)
    print("User data for 10 users written")

