from fastapi.testclient import TestClient
import pytest
from main import app


@pytest.fixture(scope="session")
def test_client():
    client = TestClient(app)
    return client

@pytest.fixture(scope="session")
def api_url():
    return "https://0.0.0.0:8000/api"




