import requests
import threading
import time
import base64

API_URL = "http://localhost:5000"
API_KEY = "1234"

def test_request(thread_id):
    """Send a test request"""
    start = time.time()
    try:
        # Simple health check
        response = requests.get(f"{API_URL}/health", timeout=10)
        elapsed = time.time() - start
        print(f"Thread {thread_id}: Status {response.status_code} - {elapsed:.2f}s")
        return True
    except Exception as e:
        print(f"Thread {thread_id}: ERROR - {e}")
        return False

def run_concurrent_test(num_requests=10):
    """Run concurrent requests"""
    print(f"\n🚀 Testing {num_requests} concurrent requests...\n")
    
    threads = []
    start_time = time.time()
    
    # Create and start threads
    for i in range(num_requests):
        thread = threading.Thread(target=test_request, args=(i+1,))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    total_time = time.time() - start_time
    print(f"\n✅ Completed {num_requests} requests in {total_time:.2f}s")
    print(f"Average: {total_time/num_requests:.2f}s per request")

if __name__ == "__main__":
    print("Testing concurrent request handling...")
    run_concurrent_test(10)
