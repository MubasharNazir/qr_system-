"""
Async SQLAlchemy database setup.
Uses asyncpg driver for PostgreSQL async operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create async engine with SSL for Supabase
# Supabase requires SSL connections
# For asyncpg, we need to pass ssl parameter in the connection string or connect_args
import ssl

# Configure SSL for Supabase connections
connect_args = {}
if "supabase.co" in settings.DATABASE_URL or "pooler.supabase.com" in settings.DATABASE_URL:
    # Create a permissive SSL context for Supabase pooler
    # Disable certificate verification to handle self-signed certificates
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    # For asyncpg, we need to pass the SSL context
    connect_args = {
        "ssl": ssl_context
    }

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,   # Recycle connections after 1 hour
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency for FastAPI routes to get database session.
    Yields a session and ensures it's closed after use.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
