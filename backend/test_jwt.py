"""
Test script for JWT authentication.
Run this to verify JWT implementation works correctly.
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_jwt_imports():
    """Test that JWT service can be imported."""
    print("Testing JWT imports...")
    try:
        from app.services.jwt_service import create_admin_token, verify_admin_token
        print("✅ JWT service imports successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import JWT service: {e}")
        return False

def test_jwt_token_creation():
    """Test JWT token creation."""
    print("\nTesting JWT token creation...")
    try:
        from app.services.jwt_service import create_admin_token
        token = create_admin_token()
        if token and len(token) > 0:
            print(f"✅ Token created successfully: {token[:20]}...")
            return token
        else:
            print("❌ Token creation returned empty value")
            return None
    except Exception as e:
        print(f"❌ Failed to create token: {e}")
        return None

def test_jwt_token_verification(token):
    """Test JWT token verification."""
    print("\nTesting JWT token verification...")
    try:
        from app.services.jwt_service import verify_admin_token
        is_valid = verify_admin_token(token)
        if is_valid:
            print("✅ Token verification successful")
            return True
        else:
            print("❌ Token verification failed")
            return False
    except Exception as e:
        print(f"❌ Failed to verify token: {e}")
        return False

def test_jwt_token_expiration():
    """Test that expired tokens are rejected."""
    print("\nTesting JWT token expiration...")
    try:
        import jwt
        from app.config import settings
        from datetime import datetime, timedelta, timezone
        
        # Create an expired token
        payload = {
            "type": "admin",
            "iat": datetime.now(timezone.utc) - timedelta(hours=25),
            "exp": datetime.now(timezone.utc) - timedelta(hours=1)  # Expired 1 hour ago
        }
        expired_token = jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        
        from app.services.jwt_service import verify_admin_token
        is_valid = verify_admin_token(expired_token)
        if not is_valid:
            print("✅ Expired tokens are correctly rejected")
            return True
        else:
            print("❌ Expired token was accepted (should be rejected)")
            return False
    except Exception as e:
        print(f"❌ Failed to test token expiration: {e}")
        return False

def test_invalid_token():
    """Test that invalid tokens are rejected."""
    print("\nTesting invalid token rejection...")
    try:
        from app.services.jwt_service import verify_admin_token
        is_valid = verify_admin_token("invalid_token_string")
        if not is_valid:
            print("✅ Invalid tokens are correctly rejected")
            return True
        else:
            print("❌ Invalid token was accepted (should be rejected)")
            return False
    except Exception as e:
        print(f"❌ Failed to test invalid token: {e}")
        return False

def test_config():
    """Test that JWT config is set."""
    print("\nTesting JWT configuration...")
    try:
        from app.config import settings
        
        if not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "your-secret-key-change-in-production":
            print("⚠️  WARNING: JWT_SECRET_KEY is using default value. Change it in production!")
        else:
            print(f"✅ JWT_SECRET_KEY is set: {settings.JWT_SECRET_KEY[:10]}...")
        
        print(f"✅ JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
        print(f"✅ JWT_EXPIRATION_HOURS: {settings.JWT_EXPIRATION_HOURS}")
        return True
    except Exception as e:
        print(f"❌ Failed to check config: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("JWT Authentication Test Suite")
    print("=" * 60)
    
    results = []
    
    # Test imports
    results.append(("Imports", test_jwt_imports()))
    
    # Test config
    results.append(("Configuration", test_config()))
    
    # Test token creation
    token = test_jwt_token_creation()
    results.append(("Token Creation", token is not None))
    
    if token:
        # Test token verification
        results.append(("Token Verification", test_jwt_token_verification(token)))
        
        # Test invalid token
        results.append(("Invalid Token Rejection", test_invalid_token()))
        
        # Test expiration
        results.append(("Token Expiration", test_jwt_token_expiration()))
    
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
        print("\n🎉 All tests passed! JWT authentication is working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
