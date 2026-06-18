from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

ROLE_ADMIN = "admin"
ROLE_LANDING = "landing"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_role(token: str = Depends(oauth2_scheme)) -> str:
    payload = _decode_token(token)
    role = payload.get("role")
    if role not in (ROLE_ADMIN, ROLE_LANDING):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin rol válido")
    return role


def require_admin(role: str = Depends(get_current_role)):
    if role != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso solo para administradores")


def require_any_auth(role: str = Depends(get_current_role)):
    pass  # any valid role (admin or landing) is accepted
