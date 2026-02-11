from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from typing import List


class Business(Base):
    """
    The Tenant. Represents the company whose books are being managed.
    """

    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    province: Mapped[str | None] = mapped_column(String(10), nullable=True)
    tax_profile: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    users: Mapped[List["User"]] = relationship(back_populates="business")
    # Use string reference with relationship() arg to avoid SQLAlchemy confusion
    transactions = relationship("Transaction", back_populates="business")


class User(Base):
    """
    The Staff Member. Can be 'founder' or 'bookkeeper'.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(
        String(50), default="founder"
    )  # founder, bookkeeper

    business_id: Mapped[int | None] = mapped_column(ForeignKey("businesses.id"), nullable=True)

    # Relationships
    business: Mapped["Business"] = relationship(back_populates="users")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
