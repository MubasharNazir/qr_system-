# Testing Guide - JWT Authentication

## ✅ Pre-Testing Checklist

1. **Dependencies Installed**
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **JWT_SECRET_KEY Set**
   - Check your `.env` file has `JWT_SECRET_KEY` set
   - If not, generate one: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

3. **Database Connected**
   - Ensure your `DATABASE_URL` is set in `.env`
   - Database should be accessible

## 🧪 Test Suite 1: JWT Service Tests

Run the JWT service tests:

```bash
cd backend
source venv/bin/activate
python test_jwt.py
```

**Expected Result:** All 6 tests should pass ✅

## 🧪 Test Suite 2: Server Startup

Start the server:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Expected Result:** Server starts without errors ✅

## 🧪 Test Suite 3: API Endpoint Tests

### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```

**Expected:** `{"status": "healthy"}`

### Test 2: Admin Login (Invalid Password)
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "wrong_password"}'
```

**Expected:** `401 Unauthorized` with error message

### Test 3: Admin Login (Valid Password)
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

**Expected:** `200 OK` with JSON containing `token` field

**Save the token** from the response for next tests.

### Test 4: Protected Endpoint (No Token)
```bash
curl http://localhost:8000/api/admin/orders
```

**Expected:** `401 Unauthorized`

### Test 5: Protected Endpoint (Invalid Token)
```bash
curl http://localhost:8000/api/admin/orders \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected:** `401 Unauthorized`

### Test 6: Protected Endpoint (Valid Token)
```bash
curl http://localhost:8000/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** `200 OK` with orders list (may be empty)

## 🧪 Test Suite 4: WebSocket Authentication

### Using Browser Console

1. Open your frontend admin dashboard
2. Open browser DevTools (F12) → Console
3. Check for WebSocket connection:
   - Should see: "WebSocket connected for order notifications"
   - Should NOT see: "403 Forbidden" errors

### Manual WebSocket Test

You can test WebSocket using a tool like `wscat`:

```bash
# Install wscat (if not installed)
npm install -g wscat

# Test WebSocket connection
wscat -c "ws://localhost:8000/api/admin/orders/ws?token=YOUR_TOKEN_HERE"
```

**Expected:** Connection established (no errors)

## 🧪 Test Suite 5: Token Persistence

1. **Login** to admin dashboard
2. **Restart** the backend server
3. **Refresh** the admin dashboard
4. **Verify** you're still logged in (no need to login again)

**Expected:** Session persists across server restart ✅

## 🧪 Test Suite 6: Token Expiration

Tokens expire after 24 hours by default. To test expiration:

1. Temporarily set short expiration in `.env`:
   ```env
   JWT_EXPIRATION_HOURS=0.001  # ~3.6 seconds
   ```

2. Restart server
3. Login and get token
4. Wait 5 seconds
5. Try to use token

**Expected:** Token rejected after expiration ✅

## 📊 Test Results Summary

After running all tests, you should have:

- ✅ JWT service tests: 6/6 passed
- ✅ Server starts without errors
- ✅ Login works with correct password
- ✅ Login rejects wrong password
- ✅ Protected endpoints require valid token
- ✅ Invalid tokens are rejected
- ✅ WebSocket connections work with JWT
- ✅ Sessions persist across server restarts

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'jwt'"
**Solution:** `pip install "pyjwt[crypto]"`

### "Invalid or expired token" errors
**Solution:** 
- Check `JWT_SECRET_KEY` is set in `.env`
- Verify token hasn't expired
- Try logging in again

### WebSocket 403 errors
**Solution:**
- Verify token is being sent in WebSocket URL
- Check token is valid (not expired)
- Ensure server has JWT_SECRET_KEY set

### Server won't start
**Solution:**
- Check all required environment variables are set
- Verify database connection
- Check for syntax errors in code

## ✅ Ready for Production

Once all tests pass:

1. ✅ Change `JWT_SECRET_KEY` to a production value
2. ✅ Change `ADMIN_PASSWORD` to a secure password
3. ✅ Set `ENVIRONMENT=production`
4. ✅ Review security settings
5. ✅ Push to GitHub

---

**All tests passing? You're ready to push! 🚀**
