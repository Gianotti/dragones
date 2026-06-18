from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.models import PickupStatus, PickupState
from app.auth import require_admin

router = APIRouter(
    prefix="/admin/pickups", tags=["pickups"], dependencies=[Depends(require_admin)]
)


@router.patch("/{pickup_id}/toggle")
def toggle_pickup(pickup_id: int, session: Session = Depends(get_session)):
    pickup = session.get(PickupStatus, pickup_id)
    if not pickup:
        raise HTTPException(status_code=404, detail="Retiro no encontrado")

    if pickup.estado == PickupState.pendiente:
        pickup.estado = PickupState.retirado
        pickup.fecha_retiro = datetime.utcnow()
    else:
        pickup.estado = PickupState.pendiente
        pickup.fecha_retiro = None

    session.add(pickup)
    session.commit()
    session.refresh(pickup)
    return pickup
