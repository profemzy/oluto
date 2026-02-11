from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class BusinessCreate(BaseModel):
    """Business creation input schema."""

    name: str = Field(..., min_length=1, max_length=200)
    province: Optional[str] = Field(
        None, description="CA province code (e.g., ON, BC, QC)"
    )
    tax_profile: Optional[str] = Field(None, description="GST/HST registration number")


class BusinessUpdate(BaseModel):
    """Business update input schema."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    province: Optional[str] = None
    tax_profile: Optional[str] = None


class BusinessResponse(BaseModel):
    """Business public view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    province: Optional[str] = None
    tax_profile: Optional[str] = None
    created_at: Optional[datetime] = None


class UserInvite(BaseModel):
    """User invitation input schema."""

    email: str
    role: str = "owner"  # owner, staff, bookkeeper
    full_name: Optional[str] = None
