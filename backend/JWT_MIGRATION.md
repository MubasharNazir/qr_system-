# JWT Authentication Migration Guide

## Overview

The admin authentication system has been migrated from in-memory sessions to JWT (JSON Web Tokens). This change provides several benefits:

✅ **Persistent Sessions**: Tokens persist across server restarts  
✅ **Stateless**: No server-side session storage needed  
✅ **Scalable**: Works with multiple server instances  
✅ **Secure**: Tokens are cryptographically signed and expire automatically

## What Changed

### Before (In-Memory Sessions)
- Sessions stored in server memory
- Lost on server restart
- Required server-side storage

### After (JWT Tokens)
- Tokens are stateless and self-contained
- Persist across server restarts
- No server-side storage needed
- Automatic expiration

## Setup Instructions

### 1. Install Dependencies

The JWT implementation requires `pyjwt[crypto]` which is already added to `requirements.txt`.

Install it:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set JWT_SECRET_KEY

**⚠️ IMPORTANT**: You must set a secure `JWT_SECRET_KEY` in your environment variables.

#### Generate a Secure Key

**Option 1: Using Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 3: Online Generator**
Use a secure random string generator (at least 32 characters)

#### Add to Environment Variables

**Local Development (.env file):**
```env
JWT_SECRET_KEY=your-generated-secret-key-here
```

**Production (Render/Cloud Platform):**
Add `JWT_SECRET_KEY` to your environment variables in your hosting platform's dashboard.

### 3. Optional: Configure Token Expiration

By default, tokens expire after 24 hours. You can change this:

```env
JWT_EXPIRATION_HOURS=48  # Tokens expire after 48 hours
```

## How It Works

1. **Login**: Admin logs in with password → Server generates JWT token
2. **Token Storage**: Client stores token in localStorage
3. **API Requests**: Client sends token in `Authorization: Bearer <token>` header
4. **Verification**: Server verifies token signature and expiration
5. **Expiration**: Token automatically expires after configured time

## Migration Notes

### Existing Users

- **No action needed**: Existing logged-in users will need to log in again after deployment
- Tokens are backward compatible - old tokens will be rejected (as expected)

### WebSocket Connections

- WebSocket connections now use JWT token authentication
- Tokens are validated on connection
- Invalid/expired tokens are rejected with proper error messages

## Security Considerations

### ✅ Best Practices

1. **Use a Strong Secret Key**
   - At least 32 characters
   - Random and unpredictable
   - Never commit to version control

2. **Set Appropriate Expiration**
   - 24 hours is a good default
   - Shorter for high-security environments
   - Longer for convenience (not recommended)

3. **HTTPS Only in Production**
   - Always use HTTPS in production
   - Prevents token interception

4. **Token Storage**
   - Client stores tokens in localStorage
   - Consider httpOnly cookies for enhanced security (future enhancement)

### ⚠️ Token Invalidation

**Current Limitation**: JWT tokens cannot be invalidated before expiration without a token blacklist.

**Solutions**:
- **Short Expiration**: Use shorter token expiration times
- **Token Blacklist**: Implement Redis/database blacklist for immediate invalidation (future enhancement)
- **Refresh Tokens**: Implement refresh token pattern (future enhancement)

## Troubleshooting

### "Invalid or expired token" Error

**Causes:**
1. Token has expired (check `JWT_EXPIRATION_HOURS`)
2. `JWT_SECRET_KEY` changed (tokens signed with old key are invalid)
3. Token is malformed

**Solution:**
- User needs to log in again
- Verify `JWT_SECRET_KEY` is set correctly

### WebSocket Connection Fails

**Causes:**
1. Token expired
2. Invalid token format
3. Missing token in query parameter

**Solution:**
- Check browser console for error messages
- Verify token is being sent in WebSocket URL
- User may need to log in again

### Tokens Not Persisting

**Causes:**
1. Client not storing token properly
2. localStorage cleared

**Solution:**
- Check frontend token storage
- Verify token is saved after login

## Testing

### Test Token Generation

```python
from app.services.jwt_service import create_admin_token, verify_admin_token

# Generate token
token = create_admin_token()
print(f"Token: {token}")

# Verify token
is_valid = verify_admin_token(token)
print(f"Valid: {is_valid}")
```

### Test Token Expiration

Tokens automatically expire after the configured time. You can test this by:
1. Generating a token
2. Waiting for expiration (or setting very short expiration)
3. Verifying it fails

## Next Steps

1. ✅ Set `JWT_SECRET_KEY` in your environment
2. ✅ Restart your backend server
3. ✅ Test login and token generation
4. ✅ Verify WebSocket connections work
5. ✅ Test token persistence across server restarts

## Support

If you encounter issues:
1. Check server logs for JWT-related errors
2. Verify `JWT_SECRET_KEY` is set correctly
3. Ensure `pyjwt[crypto]` is installed
4. Check token expiration settings

---

**Migration Complete!** Your admin authentication now uses JWT tokens that persist across server restarts. 🎉
