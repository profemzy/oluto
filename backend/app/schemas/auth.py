from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


class UserRegister(BaseModel):
    """User registration input schema."""

    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str
    role: str = "owner"  # owner, staff, bookkeeper, admin


class UserLogin(BaseModel):
    """User login credentials schema."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded JWT token payload."""

    email: Optional[str] = None


class UserResponse(BaseModel):
    """User public view (excludes password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    business_id: Optional[int] = None
