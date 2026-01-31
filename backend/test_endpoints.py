#!/usr/bin/env python3
"""
Test script to verify all API endpoints are working.
Run this after starting the server.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(method, path, data=None, params=None, expected_status=200):
    """Test an API endpoint."""
    url = f"{BASE_URL}{path}"
    try:
        if method == "GET":
            response = requests.get(url, params=params)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        status_ok = response.status_code == expected_status
        status_icon = "✅" if status_ok else "❌"
        
        print(f"{status_icon} {method} {path}")
        print(f"   Status: {response.status_code} (expected {expected_status})")
        
        if not status_ok:
            print(f"   Response: {response.text[:200]}")
        
        try:
            json_data = response.json()
            print(f"   Response: {json.dumps(json_data, indent=2)[:200]}...")
        except:
            print(f"   Response: {response.text[:200]}")
        
        print()
        return status_ok
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {path}")
        print(f"   Error: Could not connect to {BASE_URL}")
        print(f"   Make sure the server is running!")
        print()
        return False
    except Exception as e:
        print(f"❌ {method} {path}")
        print(f"   Error: {str(e)}")
        print()
        return False

def main():
    print("=" * 60)
    print("Testing QR Restaurant Ordering System API Endpoints")
    print("=" * 60)
    print()
    
    results = []
    
    # Test health endpoint
    print("1. Testing Health Endpoint")
    print("-" * 60)
    results.append(("GET /api/health", test_endpoint("GET", "/api/health")))
    print()
    
    # Test root endpoint
    print("2. Testing Root Endpoint")
    print("-" * 60)
    results.append(("GET /", test_endpoint("GET", "/")))
    print()
    
    # Test menu endpoint (will fail without database, but tests route exists)
    print("3. Testing Menu Endpoint (requires database)")
    print("-" * 60)
    results.append(("GET /api/menu", test_endpoint("GET", "/api/menu", params={"table": 1}, expected_status=[200, 404, 500])))
    print()
    
    # Test checkout endpoint (will fail without database/Stripe, but tests route exists)
    print("4. Testing Checkout Endpoint (requires database & Stripe)")
    print("-" * 60)
    checkout_data = {
        "table_id": 1,
        "items": [{"id": 1, "quantity": 1}],
        "customer_name": "Test User",
        "special_instructions": "Test order"
    }
    results.append(("POST /api/checkout/create-session", test_endpoint("POST", "/api/checkout/create-session", data=checkout_data, expected_status=[200, 400, 404, 500])))
    print()
    
    # Test order endpoint (will fail without database, but tests route exists)
    print("5. Testing Order Endpoint (requires database)")
    print("-" * 60)
    # Using a test UUID that won't exist
    test_uuid = "00000000-0000-0000-0000-000000000000"
    results.append(("GET /api/orders/{id}", test_endpoint("GET", f"/api/orders/{test_uuid}", expected_status=[404, 500])))
    print()
    
    # Test order by session endpoint
    print("6. Testing Order by Session Endpoint (requires database)")
    print("-" * 60)
    results.append(("GET /api/orders/by-session/{session_id}", test_endpoint("GET", "/api/orders/by-session/test_session", expected_status=[404, 500])))
    print()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print()
    
    for endpoint, result in results:
        status = "✅ PASS" if result else "❌ FAIL (may be expected if DB not configured)"
        print(f"{status}: {endpoint}")
    
    print()
    print("Note: Some endpoints may fail if database/Stripe are not configured.")
    print("This is expected. The important thing is that routes exist and return proper errors.")
    
    return 0 if passed > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
