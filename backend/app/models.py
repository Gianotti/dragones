from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from enum import Enum


class PickupState(str, Enum):
    pendiente = "pendiente"
    retirado = "retirado"


class Person(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    apellido: str
    email: str
    whatsapp: Optional[str] = None
    activo: bool = True
    fecha_alta: datetime = Field(default_factory=datetime.utcnow)

    pickups: list["PickupStatus"] = Relationship(back_populates="person")


class MonthlyGame(SQLModel, table=True):
    __tablename__ = "monthly_game"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre_juego: str
    mes: str  # YYYY-MM, enforced unique at DB level via migration/index
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    pickups: list["PickupStatus"] = Relationship(back_populates="game")


class PickupStatus(SQLModel, table=True):
    __tablename__ = "pickup_status"

    id: Optional[int] = Field(default=None, primary_key=True)
    person_id: int = Field(foreign_key="person.id")
    game_id: int = Field(foreign_key="monthly_game.id")
    estado: PickupState = Field(default=PickupState.pendiente)
    fecha_retiro: Optional[datetime] = None

    person: Optional[Person] = Relationship(back_populates="pickups")
    game: Optional[MonthlyGame] = Relationship(back_populates="pickups")


class Organizer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    whatsapp: str
