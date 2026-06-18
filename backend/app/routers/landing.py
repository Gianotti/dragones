from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_session
from app.models import MonthlyGame, PickupStatus, Person, Organizer
from app.auth import require_any_auth

router = APIRouter(
    prefix="/landing", tags=["landing"], dependencies=[Depends(require_any_auth)]
)


class PersonStatus(BaseModel):
    pickup_id: int
    person_id: int
    nombre: str
    apellido: str
    email: str
    estado: str
    fecha_retiro: Optional[datetime] = None


class OrganizerOut(BaseModel):
    id: int
    nombre: str
    whatsapp: str


class LandingResponse(BaseModel):
    game_id: Optional[int] = None
    nombre_juego: Optional[str] = None
    mes: Optional[str] = None
    persons: list[PersonStatus] = []
    organizers: list[OrganizerOut] = []


def _build_landing(game: Optional[MonthlyGame], session: Session) -> LandingResponse:
    organizers = [
        OrganizerOut(id=o.id, nombre=o.nombre, whatsapp=o.whatsapp)
        for o in session.exec(select(Organizer)).all()
    ]

    if not game:
        return LandingResponse(organizers=organizers)

    rows = session.exec(
        select(PickupStatus, Person)
        .join(Person, PickupStatus.person_id == Person.id)
        .where(PickupStatus.game_id == game.id)
        .where(Person.activo == True)
        .order_by(Person.apellido, Person.nombre)
    ).all()

    persons = [
        PersonStatus(
            pickup_id=ps.id,
            person_id=p.id,
            nombre=p.nombre,
            apellido=p.apellido,
            email=p.email,
            estado=ps.estado,
            fecha_retiro=ps.fecha_retiro,
        )
        for ps, p in rows
    ]

    return LandingResponse(
        game_id=game.id,
        nombre_juego=game.nombre_juego,
        mes=game.mes,
        persons=persons,
        organizers=organizers,
    )


@router.get("/current", response_model=LandingResponse)
def get_current(session: Session = Depends(get_session)):
    game = session.exec(select(MonthlyGame).order_by(MonthlyGame.mes.desc())).first()
    return _build_landing(game, session)


@router.get("/month/{mes}", response_model=LandingResponse)
def get_by_month(mes: str, session: Session = Depends(get_session)):
    game = session.exec(select(MonthlyGame).where(MonthlyGame.mes == mes)).first()
    return _build_landing(game, session)


@router.get("/months")
def list_months(session: Session = Depends(get_session)):
    games = session.exec(select(MonthlyGame).order_by(MonthlyGame.mes.desc())).all()
    return [{"mes": g.mes, "nombre_juego": g.nombre_juego, "id": g.id} for g in games]
