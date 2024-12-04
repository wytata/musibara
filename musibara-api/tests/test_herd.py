import os
import dotenv

dotenv.load_dotenv()

USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")


def test_all_herds(api_url, test_client):
   
    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_all_herd_ids(api_url, test_client):
   
    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)
    
    for herd in herds_data:

        response = test_client.get(
            f"{api_url}/herds/id/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)



def test_all_herd_ids_authed(api_url, test_client):
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    response = test_client.post(
        f"{api_url}/users/token",
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        cookies={}
    )
    
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token != "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header


    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)
    
    
    
    for herd in herds_data:

        response = test_client.get(
            f"{api_url}/herds/id/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        

def test_all_herd_posts_authed(api_url, test_client):
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    response = test_client.post(
        f"{api_url}/users/token",
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        cookies={}
    )
    
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token != "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header


    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)
    
    
    
    for herd in herds_data:

        response = test_client.get(
            f"{api_url}/herds/posts/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, type(None)))
        

def test_all_herd_playlists_authed(api_url, test_client):
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    response = test_client.post(
        f"{api_url}/users/token",
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        cookies={}
    )
    
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token != "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header


    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)
    
    for herd in herds_data:

        response = test_client.get(
            f"{api_url}/herds/playlists/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, type(None)))


def test_herd_me_authed(api_url, test_client):
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    response = test_client.post(
        f"{api_url}/users/token",
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        cookies={}
    )
    
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token != "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header


    response = test_client.get(
        f"{api_url}/herds/me",
        headers={
            'Accept': 'application/json'
        },
        cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)


def test_herd_join_and_leave(api_url, test_client):
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    response = test_client.post(
        f"{api_url}/users/token",
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        cookies={}
    )
    
    assert response.status_code == 200
    assert response.json() == {"message": "success"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token != "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header


    response = test_client.get(
        f"{api_url}/herds/all",
        headers={
            'Accept': 'application/json'
        },
        cookies={"accessToken": access_token}
    )
    assert response.status_code == 200
    herds_data = response.json()
    assert isinstance(herds_data, list)
    
    for herd in herds_data:
        if herd is None:
            continue
        
        response = test_client.post(
            f"{api_url}/herds/join/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        
        # NOTE: may need to comment this out so you can join and unfollow all of your herds you are in
        assert response.status_code == 200
        
        response = test_client.post(
            f"{api_url}/herds/join/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        assert response.status_code == 400
        
        response = test_client.post(
            f"{api_url}/herds/leave/{herd.get("herdid")}",
            headers={
                'Accept': 'application/json'
            },
            cookies={"accessToken": access_token}
        )
        assert response.status_code == 200
        
        # TODO: No error handling for if you try to leave a herd if already left


# ("api/herds/new")
# NOTE: Not testing creating new herd to not create spam herds in prod db


