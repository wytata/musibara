def test_get_all_users(api_url, test_client):
    response = test_client.get(f"{api_url}/users")
    assert response.status_code == 200

def test_get_own_user_no_auth_token(api_url, test_client):
    response = test_client.get(f"{api_url}/users/me")
    assert response.status_code == 401

def test_user_log_out_already_logged_out(api_url, test_client):
    response = test_client.get(f"{api_url}/users/logout")
    assert response.status_code == 400

def test_get_user_by_username(api_url, test_client):
    test_name = "test_will"
    response = test_client.get(f"{api_url}/users/byname/{test_name}")
    assert response.status_code == 200