"""make updated_at nullable

Revision ID: d5e9f2b3a678
Revises: c4d8f1a2e567
Create Date: 2026-02-10 23:45:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d5e9f2b3a678"
down_revision: Union[str, None] = "c4d8f1a2e567"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "transactions",
        "updated_at",
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "transactions",
        "updated_at",
        nullable=False,
    )
