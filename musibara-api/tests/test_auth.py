# def test_set_cookie(api_url, test_client):
#     response = test_client.get(f"{api_url}/set-cookie")
#     access_token = next(cookie for cookie in response.cookies if cookie.name == "accessToken")
#     assert access_token.secure
#     assert access_token.has_nonstandard_attr("HttpOnly")
#     #assert access_token.value == "foobar"

# def test_read_cookie(api_url, test_client):
#     response = test_client.get(f"{api_url}/read-cookie", cookies={"accessToken": "foobar"})
#     assert response.json() == {"accessToken": "foobar"}