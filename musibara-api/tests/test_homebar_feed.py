import os
import dotenv

dotenv.load_dotenv()

USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

def test_homebar(api_url, test_client):
    response = test_client.get(f"{api_url}/content/homebar")
    assert response.status_code == 200

def test_feed_unauthed(api_url, test_client):
    
    offset = 0
    for _ in range(10):
        response = test_client.get(f"{api_url}/content/posts/feed/{offset}")
        assert response.status_code == 200
        offset+=10
        
        feed_data = response.json()
        assert isinstance(feed_data, list)

        if not feed_data:
            break

        if feed_data:
            for post in feed_data:
                assert "postid" in post, "Missing 'postid' in post"
                assert isinstance(post["postid"], int), "'postid' should be an integer"
                
                assert "userid" in post, "Missing 'userid' in post"
                assert isinstance(post["userid"], int), "'userid' should be an integer"
                
                assert "content" in post, "Missing 'content' in post"
                assert isinstance(post["content"], str), "'content' should be a string"
                
                assert "likescount" in post, "Missing 'likescount' in post"
                assert isinstance(post["likescount"], int), "'likescount' should be an integer"
                
                assert "commentcount" in post, "Missing 'commentcount' in post"
                assert isinstance(post["commentcount"], int), "'commentcount' should be an integer"
                
                assert "createdts" in post, "Missing 'createdts' in post"
                assert isinstance(post["createdts"], str), "'createdts' should be a string"
                
                assert "title" in post, "Missing 'title' in post"
                assert isinstance(post["title"], str), "'title' should be a string"
                
                assert "herdid" in post, "Missing 'herdid' in post"
                assert isinstance(post["herdid"], int), "'herdid' should be an integer"
                
                assert "username" in post, "Missing 'username' in post"
                assert isinstance(post["username"], str), "'username' should be a string"
                
                assert "herdname" in post, "Missing 'herdname' in post"
                assert isinstance(post["herdname"], (int, str)), "'herdname' should be either an integer (-1) or a string"
                
                assert "isliked" in post, "Missing 'isliked' in post"
                assert isinstance(post["isliked"], bool), "'isliked' should be a boolean"
                
                assert "url" in post, "Missing 'url' in post"
                assert isinstance(post["url"], str), "'url' should be a string"
                
                assert "profilebucket" in post, "Missing 'profilebucket' in post"
                assert isinstance(post["profilebucket"], str), "'profilebucket' should be a string"
                
                assert "profilekey" in post, "Missing 'profilekey' in post"
                assert isinstance(post["profilekey"], str), "'profilekey' should be a string"
                
                assert "tags" in post, "Missing 'tags' in post"
                assert isinstance(post["tags"], list), "'tags' should be a list"
                
                
                for tag in post["tags"]:
                    assert "name" in tag, "Missing 'name' in tag"
                    assert isinstance(tag["name"], str), "'name' in tag should be a string"
                    
                    assert "mbid" in tag, "Missing 'mbid' in tag"
                    assert isinstance(tag["mbid"], str), "'mbid' in tag should be a string"
                    
                    assert "tag_type" in tag, "Missing 'tag_type' in tag"
                    assert isinstance(tag["tag_type"], str), "'tag_type' in tag should be a string"


def test_feed_authed(api_url, test_client):
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
    

    
    offset = 0
    for _ in range(10):
        response = test_client.get(
            f"{api_url}/content/posts/feed/{offset}",
            headers={
                'Accept': 'application/json'
            },
            cookies={
                'accessToken': access_token
            }
        )
        
        assert response.status_code == 200
        offset+=10
        
        feed_data = response.json()
        assert isinstance(feed_data, list)

        if not feed_data:
            break

        if feed_data:
            for post in feed_data:
                assert "postid" in post, "Missing 'postid' in post"
                assert isinstance(post["postid"], int), "'postid' should be an integer"
                
                assert "userid" in post, "Missing 'userid' in post"
                assert isinstance(post["userid"], int), "'userid' should be an integer"
                
                assert "content" in post, "Missing 'content' in post"
                assert isinstance(post["content"], str), "'content' should be a string"
                
                assert "likescount" in post, "Missing 'likescount' in post"
                assert isinstance(post["likescount"], int), "'likescount' should be an integer"
                
                assert "commentcount" in post, "Missing 'commentcount' in post"
                assert isinstance(post["commentcount"], int), "'commentcount' should be an integer"
                
                assert "createdts" in post, "Missing 'createdts' in post"
                assert isinstance(post["createdts"], str), "'createdts' should be a string"
                
                assert "title" in post, "Missing 'title' in post"
                assert isinstance(post["title"], str), "'title' should be a string"
                
                assert "herdid" in post, "Missing 'herdid' in post"
                assert isinstance(post["herdid"], int), "'herdid' should be an integer"
                
                assert "username" in post, "Missing 'username' in post"
                assert isinstance(post["username"], str), "'username' should be a string"
                
                assert "herdname" in post, "Missing 'herdname' in post"
                assert isinstance(post["herdname"], (int, str)), "'herdname' should be either an integer (-1) or a string"
                
                assert "isliked" in post, "Missing 'isliked' in post"
                assert isinstance(post["isliked"], bool), "'isliked' should be a boolean"
                
                assert "url" in post, "Missing 'url' in post"
                assert isinstance(post["url"], str), "'url' should be a string"
                
                assert "profilebucket" in post, "Missing 'profilebucket' in post"
                assert isinstance(post["profilebucket"], str), "'profilebucket' should be a string"
                
                assert "profilekey" in post, "Missing 'profilekey' in post"
                assert isinstance(post["profilekey"], str), "'profilekey' should be a string"
                
                assert "tags" in post, "Missing 'tags' in post"
                assert isinstance(post["tags"], list), "'tags' should be a list"
                
                
                for tag in post["tags"]:
                    assert "name" in tag, "Missing 'name' in tag"
                    assert isinstance(tag["name"], str), "'name' in tag should be a string"
                    
                    assert "mbid" in tag, "Missing 'mbid' in tag"
                    assert isinstance(tag["mbid"], str), "'mbid' in tag should be a string"
                    
                    assert "tag_type" in tag, "Missing 'tag_type' in tag"
                    assert isinstance(tag["tag_type"], str), "'tag_type' in tag should be a string"


def test_feed_authed_vs_non_authed(api_url, test_client):
    
    post_data = {
            "username" : USERNAME,
            "password" : PASSWORD
        }

    offset = 0

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
    

    response_auth = test_client.get(
        f"{api_url}/content/posts/feed/{offset}",
        headers={
            'Accept': 'application/json'
        },
        cookies={
            'accessToken': access_token
        }
    )
    assert response_auth.status_code == 200
    
    
    feed_data = response_auth.json()
    assert isinstance(feed_data, list)

    if feed_data:
        for post in feed_data:
            assert "postid" in post, "Missing 'postid' in post"
            assert isinstance(post["postid"], int), "'postid' should be an integer"
            
            assert "userid" in post, "Missing 'userid' in post"
            assert isinstance(post["userid"], int), "'userid' should be an integer"
            
            assert "content" in post, "Missing 'content' in post"
            assert isinstance(post["content"], str), "'content' should be a string"
            
            assert "likescount" in post, "Missing 'likescount' in post"
            assert isinstance(post["likescount"], int), "'likescount' should be an integer"
            
            assert "commentcount" in post, "Missing 'commentcount' in post"
            assert isinstance(post["commentcount"], int), "'commentcount' should be an integer"
            
            assert "createdts" in post, "Missing 'createdts' in post"
            assert isinstance(post["createdts"], str), "'createdts' should be a string"
            
            assert "title" in post, "Missing 'title' in post"
            assert isinstance(post["title"], str), "'title' should be a string"
            
            assert "herdid" in post, "Missing 'herdid' in post"
            assert isinstance(post["herdid"], int), "'herdid' should be an integer"
            
            assert "username" in post, "Missing 'username' in post"
            assert isinstance(post["username"], str), "'username' should be a string"
            
            assert "herdname" in post, "Missing 'herdname' in post"
            assert isinstance(post["herdname"], (int, str)), "'herdname' should be either an integer (-1) or a string"
            
            assert "isliked" in post, "Missing 'isliked' in post"
            assert isinstance(post["isliked"], bool), "'isliked' should be a boolean"
            
            assert "url" in post, "Missing 'url' in post"
            assert isinstance(post["url"], str), "'url' should be a string"
            
            assert "profilebucket" in post, "Missing 'profilebucket' in post"
            assert isinstance(post["profilebucket"], str), "'profilebucket' should be a string"
            
            assert "profilekey" in post, "Missing 'profilekey' in post"
            assert isinstance(post["profilekey"], str), "'profilekey' should be a string"
            
            assert "tags" in post, "Missing 'tags' in post"
            assert isinstance(post["tags"], list), "'tags' should be a list"
            
            
            for tag in post["tags"]:
                assert "name" in tag, "Missing 'name' in tag"
                assert isinstance(tag["name"], str), "'name' in tag should be a string"
                
                assert "mbid" in tag, "Missing 'mbid' in tag"
                assert isinstance(tag["mbid"], str), "'mbid' in tag should be a string"
                
                assert "tag_type" in tag, "Missing 'tag_type' in tag"
                assert isinstance(tag["tag_type"], str), "'tag_type' in tag should be a string"

    
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

    response = test_client.get(f"{api_url}/content/posts/feed/{offset}", cookies={})
    assert response.status_code == 200
    offset+=10
    
    feed_data = response.json()
    assert isinstance(feed_data, list)

    if feed_data:
        for post in feed_data:
            assert "postid" in post, "Missing 'postid' in post"
            assert isinstance(post["postid"], int), "'postid' should be an integer"
            
            assert "userid" in post, "Missing 'userid' in post"
            assert isinstance(post["userid"], int), "'userid' should be an integer"
            
            assert "content" in post, "Missing 'content' in post"
            assert isinstance(post["content"], str), "'content' should be a string"
            
            assert "likescount" in post, "Missing 'likescount' in post"
            assert isinstance(post["likescount"], int), "'likescount' should be an integer"
            
            assert "commentcount" in post, "Missing 'commentcount' in post"
            assert isinstance(post["commentcount"], int), "'commentcount' should be an integer"
            
            assert "createdts" in post, "Missing 'createdts' in post"
            assert isinstance(post["createdts"], str), "'createdts' should be a string"
            
            assert "title" in post, "Missing 'title' in post"
            assert isinstance(post["title"], str), "'title' should be a string"
            
            assert "herdid" in post, "Missing 'herdid' in post"
            assert isinstance(post["herdid"], int), "'herdid' should be an integer"
            
            assert "username" in post, "Missing 'username' in post"
            assert isinstance(post["username"], str), "'username' should be a string"
            
            assert "herdname" in post, "Missing 'herdname' in post"
            assert isinstance(post["herdname"], (int, str)), "'herdname' should be either an integer (-1) or a string"
            
            assert "isliked" in post, "Missing 'isliked' in post"
            assert isinstance(post["isliked"], bool), "'isliked' should be a boolean"
            
            assert "url" in post, "Missing 'url' in post"
            assert isinstance(post["url"], str), "'url' should be a string"
            
            assert "profilebucket" in post, "Missing 'profilebucket' in post"
            assert isinstance(post["profilebucket"], str), "'profilebucket' should be a string"
            
            assert "profilekey" in post, "Missing 'profilekey' in post"
            assert isinstance(post["profilekey"], str), "'profilekey' should be a string"
            
            assert "tags" in post, "Missing 'tags' in post"
            assert isinstance(post["tags"], list), "'tags' should be a list"
            
            
            for tag in post["tags"]:
                assert "name" in tag, "Missing 'name' in tag"
                assert isinstance(tag["name"], str), "'name' in tag should be a string"
                
                assert "mbid" in tag, "Missing 'mbid' in tag"
                assert isinstance(tag["mbid"], str), "'mbid' in tag should be a string"
                
                assert "tag_type" in tag, "Missing 'tag_type' in tag"
                assert isinstance(tag["tag_type"], str), "'tag_type' in tag should be a string"
    
    assert response.json() != response_auth.json()
    
