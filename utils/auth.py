
import os
from datetime import datetime, timedelta, timezone  
from typing import Any, Dict, Optional  

from dotenv import load_dotenv  
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer  
from jose import JWTError, jwt  
from jose.exceptions import ExpiredSignatureError  
from passlib.context import CryptContext  
from pydantic import BaseModel

from . import database

class User(BaseModel):
    id: int
    username: str
    is_active: Optional[bool] = True

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")) 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    return pwd_context.hash(password)

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
    
    if "sub" not in to_encode:
        raise ValueError("Missing 'sub' key in token data for JWT subject")

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") 

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:  
    """
    Decodes the JWT token, validates it, and fetches the user from the database.
    Used as a base dependency.

    Raises HTTPException 401 if token is invalid, expired, or user not found.
    """  
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", 
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session has expired", 
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            print("Token missing username (sub claim)")
            raise credentials_exception
        token_data = TokenData(username=username)
    
    except ExpiredSignatureError:
        print("JWTError decoding token: Signature has expired.")
        raise expired_exception 
    
    except JWTError as e:
        print(f"JWTError decoding token: {e}")
        raise credentials_exception from e 
    except Exception as e:
        print(f"Unexpected error decoding token: {e}")
        raise credentials_exception from e
    user = await database.get_user_by_username(username=token_data.username)
    if user is None:
        print(f"User '{token_data.username}' from token not found in DB")
        raise credentials_exception 
    return user

async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> User:  
    """
    Wrapper dependency that checks if the user fetched by get_current_user is active.
    Use this dependency in your path operations for protected routes.

    Raises HTTPException 400 if user is inactive.
    Returns a User Pydantic model instance.
    """  
    if not current_user.get("is_active"): 
        print(f"User '{current_user.get('username')}' is inactive.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    return User(**current_user)
