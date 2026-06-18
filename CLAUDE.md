# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Web app for coordinating monthly board game pickups for the "Aquí Hay Dragones" community in Mar del Plata. Subscribers receive one random game per month; this system tracks who has/hasn't picked theirs up.

Two user roles:
- **Admin** (single user, credentials in `.env`): full CRUD, sets the monthly game, marks pickups.
- **Landing** (shared credentials diffused via WhatsApp): read-only view of the same data.

## Dev commands

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py           # creates sample organizers + a demo person
uvicorn app.main:app --reload
```

API at `http://localhost:8000` · Swagger at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev              # http://localhost:3000
npm run build && npm start
npm run lint
```

### With Docker + PostgreSQL

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

### Alembic (migrations, needed for PostgreSQL)

```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "description"
```

> For SQLite dev the tables are auto-created on startup via `create_db_and_tables()` — no Alembic needed.

## Architecture

### Backend (`backend/`)

**Stack:** FastAPI + SQLModel (SQLAlchemy under the hood) + Pydantic v2. SQLite for dev, PostgreSQL for prod. JWT auth via `python-jose`.

**Key files:**
- `app/models.py` — four SQLModel table classes: `Person`, `MonthlyGame`, `PickupStatus`, `Organizer`. `PickupStatus` is the join table between a person and a monthly game, holding `estado` (enum: `pendiente`/`retirado`) and `fecha_retiro`.
- `app/auth.py` — two dependency functions: `require_admin` (role=`admin` only) and `require_any_auth` (admin or landing). Cookies are not used server-side; the API is stateless JWT.
- `app/config.py` — `Settings` via `pydantic-settings`. All secrets (admin creds, landing creds, JWT secret) come from environment variables / `.env`.
- `app/routers/landing.py` — the only router accessible to the `landing` role. Returns denormalized `PersonStatus` objects (no raw model fields exposed beyond name, apellido, email, estado).

**Business rule:** Creating a `MonthlyGame` automatically generates one `PickupStatus(estado=pendiente)` per currently-active `Person`. Adding a new `Person` after a game exists enrolls them in the latest game automatically.

### Frontend (`frontend/`)

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS. No UI component library — plain Tailwind classes.

**Auth flow:**
1. Login page (`/login`) tries admin credentials first, falls back to landing credentials.
2. On success, JWT and role are stored in **two browser cookies** (`dragones_token`, `dragones_role`).
3. `middleware.ts` reads those cookies to protect `/admin/*` (requires role=`admin`) and `/landing/*` (requires any token).
4. `src/lib/api.ts` attaches the token from cookies to every `Authorization: Bearer` header.

**Route structure:**
- `/` — redirects based on stored role (or to `/login`)
- `/login` — unified login; `?from=admin` forces admin-only auth
- `/landing` — read-only view; month selector, people table, organizer WhatsApp links
- `/admin` — dashboard: current game + pickup status table with toggle buttons
- `/admin/persons` — ABM (create/edit/toggle-active)
- `/admin/games` — create monthly game (triggers bulk pickup creation on API), edit game name
- `/admin/organizers` — CRUD

**Polling / real-time:** The landing page does not auto-refresh. The admin's toggle calls `PATCH /admin/pickups/{id}/toggle` then reloads the current month's data — the landing reflects the change on next user refresh.

## API contract

All admin endpoints are under `/admin/*` and require `Authorization: Bearer <admin-JWT>`.  
All landing endpoints are under `/landing/*` and accept any valid JWT (admin or landing).

Key endpoints:
- `POST /auth/login` — admin JWT
- `POST /auth/landing-login` — landing JWT
- `POST /admin/games/` — creates game + bulk `PickupStatus` for all active persons
- `PATCH /admin/pickups/{id}/toggle` — flips pendiente↔retirado
- `GET /landing/current` — latest game + all active persons with pickup state (name, apellido, email, estado)
- `GET /landing/months` — list of all months for the history selector

## Environment variables

All secrets live in `backend/.env` (never commit it). See `.env.example` for all keys. The only frontend env var is `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
