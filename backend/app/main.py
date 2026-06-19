from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth, persons, games, pickups, organizers, landing

app = FastAPI(
    title="Aquí Hay Dragones — Gestión de Retiros",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(auth.router)
app.include_router(persons.router)
app.include_router(games.router)
app.include_router(pickups.router)
app.include_router(organizers.router)
app.include_router(landing.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
