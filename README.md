# Aquí Hay Dragones — Gestión de Retiros (Mar del Plata)

Sistema para coordinar el retiro físico de juegos de mesa del mes entre los suscriptores de la comunidad en Mar del Plata.

## Levantado local rápido (SQLite, sin Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env         # ajustar credenciales si se quiere
python seed.py               # crea organizadores y persona demo
uvicorn app.main:app --reload
# API disponible en http://localhost:8000
# Documentación: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# App disponible en http://localhost:3000
```

Credenciales por defecto (definidas en `backend/.env`):
- **Admin:** `admin` / `changeme123`
- **Landing:** `dragones` / `changeme123`

---

## Con Docker + PostgreSQL

```bash
cp backend/.env.example backend/.env   # ajustar antes de levantar
docker compose up --build
```

La app queda disponible en `http://localhost:3000`.

### Migraciones con Alembic (PostgreSQL)

En lugar de `create_db_and_tables()` en startup, usar Alembic:

```bash
cd backend
alembic upgrade head      # aplica migraciones
alembic revision --autogenerate -m "descripcion"   # genera nueva migración
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | SQLite o PostgreSQL | `sqlite:///./dragones.db` |
| `ADMIN_USERNAME` | Usuario del admin | `admin` |
| `ADMIN_PASSWORD` | Contraseña del admin | `changeme123` |
| `LANDING_USERNAME` | Usuario compartido para la landing | `dragones` |
| `LANDING_PASSWORD` | Contraseña compartida para la landing | `changeme123` |
| `SECRET_KEY` | Clave para firmar JWTs | cambiar en producción |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend FastAPI |

---

## Estructura del proyecto

```
dragones/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   ├── config.py        # Settings via pydantic-settings
│   │   ├── database.py      # Engine y get_session
│   │   ├── models.py        # SQLModel: Person, MonthlyGame, PickupStatus, Organizer
│   │   ├── auth.py          # JWT, require_admin, require_any_auth
│   │   └── routers/
│   │       ├── auth.py      # POST /auth/login, /auth/landing-login
│   │       ├── persons.py   # CRUD /admin/persons
│   │       ├── games.py     # CRUD /admin/games
│   │       ├── pickups.py   # PATCH /admin/pickups/{id}/toggle
│   │       ├── organizers.py
│   │       └── landing.py   # GET /landing/current, /landing/month/{mes}, /landing/months
│   ├── alembic/             # Migraciones DB
│   └── seed.py
└── frontend/
    └── src/
        ├── app/
        │   ├── login/       # Login unificado (detecta admin vs landing)
        │   ├── landing/     # Vista pública protegida con login compartido
        │   └── admin/       # Panel admin (layout con sidebar)
        │       ├── page.tsx          # Dashboard: retiros del mes vigente + toggles
        │       ├── persons/page.tsx  # ABM personas
        │       ├── games/page.tsx    # Publicar juego del mes
        │       └── organizers/page.tsx
        ├── lib/
        │   ├── api.ts       # Cliente fetch tipado contra FastAPI
        │   └── auth.ts      # Manejo de cookies (token + rol)
        └── middleware.ts    # Protección de rutas por rol
```
