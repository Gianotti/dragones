"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-18
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "person",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("apellido", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("whatsapp", sa.String(), nullable=True),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("fecha_alta", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "monthly_game",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre_juego", sa.String(), nullable=False),
        sa.Column("mes", sa.String(7), nullable=False),
        sa.Column("fecha_creacion", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("mes", name="uq_monthly_game_mes"),
    )

    op.create_table(
        "pickup_status",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("person_id", sa.Integer(), sa.ForeignKey("person.id"), nullable=False),
        sa.Column("game_id", sa.Integer(), sa.ForeignKey("monthly_game.id"), nullable=False),
        sa.Column("estado", sa.String(), nullable=False, server_default="pendiente"),
        sa.Column("fecha_retiro", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "organizer",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("whatsapp", sa.String(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("pickup_status")
    op.drop_table("monthly_game")
    op.drop_table("person")
    op.drop_table("organizer")
