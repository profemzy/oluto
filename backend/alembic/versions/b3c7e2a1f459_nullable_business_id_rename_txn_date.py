"""Make user business_id nullable and rename transaction date column

Revision ID: b3c7e2a1f459
Revises: f816db6adf18
Create Date: 2026-02-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c7e2a1f459'
down_revision: Union[str, Sequence[str], None] = 'f816db6adf18'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make users.business_id nullable (registration creates users without a business)
    op.alter_column('users', 'business_id',
                    existing_type=sa.INTEGER(),
                    nullable=True)

    # Rename transactions.date to transactions.transaction_date
    op.alter_column('transactions', 'date',
                    new_column_name='transaction_date')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('transactions', 'transaction_date',
                    new_column_name='date')

    op.alter_column('users', 'business_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)
