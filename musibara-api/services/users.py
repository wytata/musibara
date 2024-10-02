import json

async def getAllUsers():
    data = None
    with open("sampleData/users.json") as usersJson:
        data = json.load(usersJson)
    return data
