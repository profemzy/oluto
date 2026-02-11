"""Add import_source and import_batch_id to transactions

Revision ID: c4d8f1a2e567
Revises: b3c7e2a1f459
Create Date: 2026-02-10 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d8f1a2e567'
down_revision: Union[str, None] = 'b3c7e2a1f459'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('transactions', sa.Column('import_source', sa.String(50), nullable=True))
    op.add_column('transactions', sa.Column('import_batch_id', sa.String(36), nullable=True))
    op.create_index('ix_transactions_import_batch_id', 'transactions', ['import_batch_id'])


def downgrade() -> None:
    op.drop_index('ix_transactions_import_batch_id', table_name='transactions')
    op.drop_column('transactions', 'import_batch_id')
    op.drop_column('transactions', 'import_source')
