#!/bin/bash

# Quick test script for JWT authentication
# Run this before pushing to GitHub

echo "=========================================="
echo "JWT Authentication Quick Test"
echo "=========================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Test 1: JWT Service
echo "Test 1: JWT Service Tests"
echo "------------------------"
python test_jwt.py
JWT_RESULT=$?
echo ""

# Test 2: Server Import
echo "Test 2: Server Import Test"
echo "------------------------"
python -c "from app.main import app; print('✅ Server imports successfully')"
IMPORT_RESULT=$?
echo ""

# Test 3: Integration Test
echo "Test 3: Integration Test"
echo "------------------------"
python -c "
from app.services.jwt_service import create_admin_token, verify_admin_token
from app.config import settings

token = create_admin_token()
is_valid = verify_admin_token(token)
key_set = bool(settings.JWT_SECRET_KEY and settings.JWT_SECRET_KEY != 'your-secret-key-change-in-production')

if is_valid and key_set:
    print('✅ Integration test passed')
    exit(0)
else:
    print('❌ Integration test failed')
    exit(1)
"
INTEGRATION_RESULT=$?
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ $JWT_RESULT -eq 0 ] && [ $IMPORT_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ]; then
    echo "✅ All tests passed!"
    echo ""
    echo "Next steps:"
    echo "1. Start server: uvicorn app.main:app --reload --port 8000"
    echo "2. Test login endpoint manually"
    echo "3. Test WebSocket connection from frontend"
    echo "4. If all works, you're ready to push to GitHub! 🚀"
    exit 0
else
    echo "❌ Some tests failed. Please fix errors before pushing."
    exit 1
fi
