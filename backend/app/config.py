"""
Application configuration using Pydantic Settings.
Loads environment variables with validation.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # App Configuration
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"
    PORT: int = 8080
    
    # Admin
    ADMIN_PASSWORD: str = "admin123"  # Change this in production!
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"  # Change this in production!
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24  # Token expires after 24 hours
    
    # CORS (comma-separated string from env, or default list)
    CORS_ORIGINS: Optional[str] = None
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS from comma-separated string or use defaults."""
        if self.CORS_ORIGINS:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return [self.FRONTEND_URL, "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
