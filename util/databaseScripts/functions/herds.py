from typing import List 
import random
from typing import List, Dict


genres = [
    "Ambient", "Jazz", "Blues", "Classical", "Rock", "Metal", 
    "Reggae", "Hip-Hop", "Country", "Electronic", "Folk", "Indie", 
    "Punk", "R&B", "Soul", "Pop", "Dance", "Funk", "House", "Dubstep"
]

vibes = [
    "Lofi", "Chillwave", "Synthwave", "Dream pop", "Vaporwave", 
    "Downtempo", "Tranquil", "Groovy", "Nostalgic", "Ethereal", 
    "Energetic", "Melancholic", "Uplifting", "Mystical", 
    "Psychedelic", "Cosmic", "Introspective", "Eerie", "Vibrant", 
    "Laid-back"
]

additional_terms = [
    "Rhythm", "Melody", "Harmony", "Beat", "Soundscape", "Vibe", 
    "Frequency", "Pulse", "Echo", "Groove", "Bassline", "Acoustic", 
    "Jam", "Session", "Anthem", "Collective", "Union", "Nexus", 
    "Sanctuary"
]

herd_data  = [genres, vibes, additional_terms]

def create_herds(opened_file, num_herds: int, users: List[str]):
    post_data = []
    herd_set = set()
    herd_range = num_herds
    herd_ids = 0
    herd_userids = []
    for _ in range(herd_range):
        herd_name = f'{random.choice(herd_data[random.randint(0,2)])} {random.choice(herd_data[random.randint(0,2)])}'
        if herd_name in herd_set:
            herd_range+=1
            continue
        herd_set.add(herd_name)
        herd_description = f'We are a data generated community centered around {random.choice(herd_data[random.randint(0,2)])}! (that was a lie :P)' 
        usercount = random.randint(0, len(users)-1)
        herd_ids +=1
        herd_userids.append((herd_ids, usercount))
        post_data.append(f"( {herd_ids}, '{herd_name}', '{herd_description}', {usercount})")

    insert_posts_string = f"""
    INSERT INTO herds (herdid, name, description, usercount) VALUES {', '.join(post_data)}; """

    print(insert_posts_string, file=opened_file)
    print(f"{num_herds} random herds created...")
    
    users_herds: Dict[int, List[int]]= {u:[0] for u in users}
    for id, count in herd_userids:

        for _ in range(count):
            user = random.choice(users)
            users_herds[user].append(id)
    print(users_herds)
    return users_herds
