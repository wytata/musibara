
def create_users_in_herds(opened_file, herds_users):
    #herds_users = DICT[user_id, LIST[herds_ids]]
    
    users_in_herds = []
    for user_id, herds in herds_users.items():
        for herd_id in herds:
            users_in_herds.append(f"({user_id}, {herd_id})")
    
    insert_herds_users_query = f"""
    INSERT INTO herdsusers (userid, herdid) VALUES {', '.join(users_in_herds)}; """

    print(insert_herds_users_query, file=opened_file)
    print(f"Herd's users added ...")