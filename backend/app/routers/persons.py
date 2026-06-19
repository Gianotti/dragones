from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from app.database import get_session
from app.models import Person, PickupStatus, MonthlyGame
from app.auth import require_admin

router = APIRouter(
    prefix="/admin/persons", tags=["persons"], dependencies=[Depends(require_admin)]
)


class PersonCreate(BaseModel):
    nombre: str
    apellido: str
    email: str
    whatsapp: Optional[str] = None


class PersonUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    activo: Optional[bool] = None


@router.get("")
def list_persons(session: Session = Depends(get_session)):
    return session.exec(select(Person).order_by(Person.apellido, Person.nombre)).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_person(data: PersonCreate, session: Session = Depends(get_session)):
    person = Person(**data.model_dump())
    session.add(person)
    session.flush()

    # Enroll in the current (latest) monthly game automatically
    latest_game = session.exec(
        select(MonthlyGame).order_by(MonthlyGame.mes.desc())
    ).first()
    if latest_game:
        pickup = PickupStatus(person_id=person.id, game_id=latest_game.id)
        session.add(pickup)

    session.commit()
    session.refresh(person)
    return person


@router.put("/{person_id}")
def update_person(person_id: int, data: PersonUpdate, session: Session = Depends(get_session)):
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(person, key, value)
    session.add(person)
    session.commit()
    session.refresh(person)
    return person


@router.patch("/{person_id}/toggle-active")
def toggle_active(person_id: int, session: Session = Depends(get_session)):
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    person.activo = not person.activo
    session.add(person)
    session.commit()
    session.refresh(person)
    return person
