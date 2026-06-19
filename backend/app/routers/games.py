import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from app.database import get_session
from app.models import MonthlyGame, Person, PickupStatus
from app.auth import require_admin

router = APIRouter(
    prefix="/admin/games", tags=["games"], dependencies=[Depends(require_admin)]
)


class GameCreate(BaseModel):
    nombre_juego: str
    mes: str  # YYYY-MM


class GameUpdate(BaseModel):
    nombre_juego: str


@router.get("")
def list_games(session: Session = Depends(get_session)):
    return session.exec(select(MonthlyGame).order_by(MonthlyGame.mes.desc())).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_game(data: GameCreate, session: Session = Depends(get_session)):
    if not re.match(r"^\d{4}-\d{2}$", data.mes):
        raise HTTPException(status_code=400, detail="El mes debe tener formato YYYY-MM")

    existing = session.exec(
        select(MonthlyGame).where(MonthlyGame.mes == data.mes)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Ya existe un juego para {data.mes}")

    game = MonthlyGame(nombre_juego=data.nombre_juego, mes=data.mes)
    session.add(game)
    session.flush()

    active_persons = session.exec(select(Person).where(Person.activo == True)).all()
    for person in active_persons:
        session.add(PickupStatus(person_id=person.id, game_id=game.id))

    session.commit()
    session.refresh(game)
    return game


@router.put("/{game_id}")
def update_game(game_id: int, data: GameUpdate, session: Session = Depends(get_session)):
    game = session.get(MonthlyGame, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    game.nombre_juego = data.nombre_juego
    session.add(game)
    session.commit()
    session.refresh(game)
    return game
