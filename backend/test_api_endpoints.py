"""
Test script for API endpoints with JWT authentication.
Tests the admin login and token usage.
"""
import sys
import os
import requests
import time
import subprocess
import signal

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE_URL = "http://localhost:8000"
ADMIN_PASSWORD = "admin123"  # Default password

def check_server_running():
    """Check if the server is running."""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=2)
        if response.status_code == 200:
            print("✅ Server is running")
            return True
    except requests.exceptions.RequestException:
        print("⚠️  Server is not running. Starting server...")
        return False
    return False

def start_server():
    """Start the server in the background."""
    print("Starting server...")
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8000"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    for i in range(30):
        time.sleep(1)
        try:
            response = requests.get(f"{BASE_URL}/api/health", timeout=1)
            if response.status_code == 200:
                print("✅ Server started successfully")
                return process
        except:
            pass
    
    print("❌ Server failed to start within 30 seconds")
    process.terminate()
    return None

def test_admin_login():
    """Test admin login endpoint."""
    print("\nTesting admin login...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and data["token"]:
                print(f"✅ Login successful. Token received: {data['token'][:30]}...")
                return data["token"]
            else:
                print("❌ Login response missing token")
                return None
        else:
            print(f"❌ Login failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def test_invalid_login():
    """Test login with wrong password."""
    print("\nTesting invalid login...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"},
            timeout=5
        )
        
        if response.status_code == 401:
            print("✅ Invalid password correctly rejected")
            return True
        else:
            print(f"❌ Invalid password was accepted (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Invalid login test failed: {e}")
        return False

def test_protected_endpoint(token):
    """Test accessing a protected endpoint with token."""
    print("\nTesting protected endpoint...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ Protected endpoint accessible with valid token")
            return True
        else:
            print(f"❌ Protected endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Protected endpoint test failed: {e}")
        return False

def test_protected_endpoint_no_token():
    """Test accessing protected endpoint without token."""
    print("\nTesting protected endpoint without token...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            timeout=5
        )
        
        if response.status_code == 401:
            print("✅ Protected endpoint correctly rejects requests without token")
            return True
        else:
            print(f"❌ Protected endpoint allowed access without token (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Protected endpoint test failed: {e}")
        return False

def test_invalid_token():
    """Test accessing protected endpoint with invalid token."""
    print("\nTesting protected endpoint with invalid token...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": "Bearer invalid_token_12345"},
            timeout=5
        )
        
        if response.status_code == 401:
            print("✅ Protected endpoint correctly rejects invalid token")
            return True
        else:
            print(f"❌ Protected endpoint allowed invalid token (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Invalid token test failed: {e}")
        return False

def main():
    """Run all API tests."""
    print("=" * 60)
    print("API Endpoint Test Suite (JWT Authentication)")
    print("=" * 60)
    
    server_process = None
    results = []
    
    try:
        # Check if server is running
        if not check_server_running():
            server_process = start_server()
            if not server_process:
                print("\n❌ Cannot proceed without server. Please start it manually:")
                print("   cd backend && source venv/bin/activate && uvicorn app.main:app --port 8000")
                return 1
        
        # Test invalid login
        results.append(("Invalid Login", test_invalid_login()))
        
        # Test login
        token = test_admin_login()
        results.append(("Admin Login", token is not None))
        
        if token:
            # Test protected endpoints
            results.append(("Protected Endpoint (No Token)", test_protected_endpoint_no_token()))
            results.append(("Protected Endpoint (Invalid Token)", test_invalid_token()))
            results.append(("Protected Endpoint (Valid Token)", test_protected_endpoint(token)))
        
        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All API tests passed! JWT authentication is working correctly.")
            return 0
        else:
            print("\n⚠️  Some tests failed. Please check the errors above.")
            return 1
    
    finally:
        # Clean up: stop server if we started it
        if server_process:
            print("\nStopping test server...")
            server_process.terminate()
            server_process.wait()
            print("✅ Server stopped")

if __name__ == "__main__":
    sys.exit(main())
