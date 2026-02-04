"""
JWT service for admin authentication tokens.
Provides stateless authentication that persists across server restarts.
"""
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


def create_admin_token() -> str:
    """
    Create a JWT token for admin authentication.
    
    Returns:
        str: JWT token string
    """
    payload = {
        "type": "admin",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token


def verify_admin_token(token: str) -> bool:
    """
    Verify an admin JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        bool: True if token is valid, False otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != "admin":
            logger.warning("Token type mismatch")
            return False
        
        return True
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return False
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return False
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        return False


def get_token_expiration(token: str) -> Optional[datetime]:
    """
    Get the expiration time of a token without verifying it.
    Useful for checking if token is about to expire.
    
    Args:
        token: JWT token string
        
    Returns:
        Optional[datetime]: Expiration time or None if invalid
    """
    try:
        # Decode without verification to get expiration
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": False, "verify_exp": False}
        )
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    except Exception as e:
        logger.error(f"Error getting token expiration: {e}")
    return None
