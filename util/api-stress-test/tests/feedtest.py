import threading
import requests
import time

def test_api_call(url, thread_id):
    start_time = time.time()
    try:
        response = requests.get(url)
        response_time = time.time() - start_time 
        if response.status_code == 200:
            print(f"Thread-{thread_id}: Success - Response time: {response_time:.4f}s")
        else:
            print(f"Thread-{thread_id}: Error {response.status_code} - Response time: {response_time:.4f}s")
    except Exception as e:
        print(f"Thread-{thread_id}: Request failed: {str(e)}")

def stress_test_with_threads(url, num_requests):
    threads = []
    for i in range(num_requests):
        thread = threading.Thread(target=test_api_call, args=(url, i + 1))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()

def start_feed_test():
    api_url = "http://0.0.0.0:8000/api/content/posts/feed/0"
    num_requests = 100  
    print(f"Starting stress test with {num_requests} requests...")
    start = time.time()
    stress_test_with_threads(api_url, num_requests)
    print(f"\nTOTAL TIME for {num_requests} concurrent requests: {time.time()-start} seconds")
