
def test_homebar(api_url, test_client):
    response = test_client.get(f"{api_url}/content/homebar")
    assert response.status_code == 200

def test_feed(api_url, test_client):
    response = test_client.get(f"{api_url}/content/posts/feed/0")
    assert response.status_code == 200