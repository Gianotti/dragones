from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.config import settings
from app.auth import create_access_token, ROLE_ADMIN, ROLE_LANDING

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


@router.post("/login", response_model=TokenResponse)
def admin_login(data: LoginRequest):
    if data.username == settings.admin_username and data.password == settings.admin_password:
        token = create_access_token({"role": ROLE_ADMIN, "sub": data.username})
        return TokenResponse(access_token=token, role=ROLE_ADMIN)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")


@router.post("/landing-login", response_model=TokenResponse)
def landing_login(data: LoginRequest):
    if data.username == settings.landing_username and data.password == settings.landing_password:
        token = create_access_token({"role": ROLE_LANDING, "sub": data.username})
        return TokenResponse(access_token=token, role=ROLE_LANDING)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
