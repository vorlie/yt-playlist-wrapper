# utils/auth.py

import os
from datetime import datetime, timedelta, timezone # Use timezone-aware datetime
from typing import Optional, Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer # Handles extracting token from header
from jose import JWTError, jwt # For JWT encoding/decoding
from passlib.context import CryptContext # For password hashing
from pydantic import BaseModel
from dotenv import load_dotenv # For loading environment variables

# Import database functions and user model placeholder
from . import database

# Let's redefine it here for clarity within auth context
class User(BaseModel):
    id: int
    username: str
    is_active: Optional[bool] = True

# Load environment variables from .env file
load_dotenv()

# --- Configuration (IMPORTANT: Keep SECRET_KEY secret!) ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")) # Default: 30 minutes

# --- Password Hashing ---
# Use bcrypt as the hashing scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    return pwd_context.hash(password)

# --- JWT Token Handling ---

class TokenData(BaseModel):
    """Pydantic model for data expected inside the JWT payload."""
    username: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Ensure 'sub' (subject/username) is present
    if "sub" not in to_encode:
        raise ValueError("Missing 'sub' key in token data for JWT subject")

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- FastAPI Dependency for Authentication ---

# OAuth2PasswordBearer points to the URL endpoint that issues the token (our login route)
# It extracts the token from the 'Authorization: Bearer <token>' header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # Relative URL to the token endpoint

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Decodes the JWT token, validates it, and fetches the user from the database.
    Used as a base dependency.

    Raises HTTPException 401 if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub") # 'sub' usually holds the username
        if username is None:
            print("Token missing username (sub claim)")
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError as e:
        print(f"JWTError decoding token: {e}")
        raise credentials_exception from e
    except Exception as e: # Catch other potential errors during decoding
        print(f"Unexpected error decoding token: {e}")
        raise credentials_exception from e

    # Fetch user from database using the username from the token
    user = await database.get_user_by_username(username=token_data.username)
    if user is None:
        print(f"User '{token_data.username}' from token not found in DB")
        raise credentials_exception
    # Note: User is returned as a dict from the database function
    return user


async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> User:
    """
    Wrapper dependency that checks if the user fetched by get_current_user is active.
    Use this dependency in your path operations for protected routes.

    Raises HTTPException 400 if user is inactive.
    Returns a User Pydantic model instance.
    """
    if not current_user.get("is_active"): # Check the 'is_active' field from the DB result
        print(f"User '{current_user.get('username')}' is inactive.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    # Convert the user dictionary from DB into the User Pydantic model
    # This also helps validate the structure slightly
    return User(**current_user)