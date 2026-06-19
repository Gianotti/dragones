from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from app.database import get_session
from app.models import Organizer
from app.auth import require_admin

router = APIRouter(
    prefix="/admin/organizers", tags=["organizers"], dependencies=[Depends(require_admin)]
)


class OrganizerCreate(BaseModel):
    nombre: str
    whatsapp: str


@router.get("")
def list_organizers(session: Session = Depends(get_session)):
    return session.exec(select(Organizer)).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_organizer(data: OrganizerCreate, session: Session = Depends(get_session)):
    organizer = Organizer(**data.model_dump())
    session.add(organizer)
    session.commit()
    session.refresh(organizer)
    return organizer


@router.put("/{organizer_id}")
def update_organizer(
    organizer_id: int, data: OrganizerCreate, session: Session = Depends(get_session)
):
    organizer = session.get(Organizer, organizer_id)
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizador no encontrado")
    organizer.nombre = data.nombre
    organizer.whatsapp = data.whatsapp
    session.add(organizer)
    session.commit()
    session.refresh(organizer)
    return organizer


@router.delete("/{organizer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organizer(organizer_id: int, session: Session = Depends(get_session)):
    organizer = session.get(Organizer, organizer_id)
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizador no encontrado")
    session.delete(organizer)
    session.commit()
