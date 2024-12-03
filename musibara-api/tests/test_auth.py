import os
import dotenv

dotenv.load_dotenv()

USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")


def test_login(api_url, test_client):
    # Testing loggin in
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
    
    #testing logging in with wrong credentials 
    post_data = {
        "username" : "Fake_username",
        "password" : "fake52346789"
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
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect username or password"}
    
    access_token = response.cookies.get("accessToken")
    assert access_token is None
    
    
def test_login_and_logout(api_url, test_client):
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
        f"{api_url}/users/logout",
        headers={
            'Accept': 'application/json'
        },
        cookies={
            'accessToken': access_token
        }
    )
    
    # testing logout, once already logged out
    assert response.status_code == 200
    access_token = response.cookies.get("accessToken")
    assert access_token is not None
    cookie_header = response.headers.get('Set-Cookie', '')
    assert access_token == "invalid"
    assert 'Secure' in cookie_header
    assert 'HttpOnly' in cookie_header
    
    response = test_client.get(
        f"{api_url}/users/logout",
        headers={
            'Accept': 'application/json'
        },
        cookies={
            'accessToken': access_token
        }
    )
    
    assert response.status_code==400
    assert response.json() == {"msg": "You are already logged out."}
    access_token = response.cookies.get("accessToken")
    assert access_token is None
