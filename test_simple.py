#!/usr/bin/env python3
"""
Simple test script to verify the API is working without a real PDF
"""

import requests
import json

# Test configuration
API_URL = "http://localhost:5000"
API_KEY = "1234"  # From your .env file

def test_health():
    """Test health endpoint"""
    print("\n" + "="*80)
    print("Testing Health Endpoint")
    print("="*80)

    response = requests.get(f"{API_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    return response.status_code == 200

def test_api_info():
    """Test root endpoint"""
    print("\n" + "="*80)
    print("Testing API Info Endpoint")
    print("="*80)

    response = requests.get(f"{API_URL}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    return response.status_code == 200

def test_auth_required():
    """Test that authentication is required"""
    print("\n" + "="*80)
    print("Testing Authentication Required")
    print("="*80)

    response = requests.post(
        f"{API_URL}/analyze-resume",
        json={"file": "test"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    return response.status_code == 401

def test_invalid_request():
    """Test invalid request handling"""
    print("\n" + "="*80)
    print("Testing Invalid Request Handling")
    print("="*80)

    response = requests.post(
        f"{API_URL}/analyze-resume",
        headers={"X-API-Key": API_KEY},
        json={"invalid": "data"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    return response.status_code == 400

def main():
    print("\n" + "="*80)
    print("RESUME INSIGHT SCORING API - SIMPLE TEST")
    print("="*80)

    results = {
        "Health Check": test_health(),
        "API Info": test_api_info(),
        "Auth Required": test_auth_required(),
        "Invalid Request": test_invalid_request()
    }

    print("\n" + "="*80)
    print("TEST RESULTS SUMMARY")
    print("="*80)

    for test_name, passed in results.items():
        status = "[PASSED]" if passed else "[FAILED]"
        print(f"{test_name:30} {status}")

    all_passed = all(results.values())

    if all_passed:
        print("\n[PASSED] All tests passed! API is working correctly.")
        print("\nNext steps:")
        print("  1. Place a PDF resume in this directory")
        print("  2. Run: python test_api.py your-resume.pdf")
        print("  3. The API will analyze the resume and return detailed scoring")
    else:
        print("\n[FAILED] Some tests failed. Check the output above.")

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())
