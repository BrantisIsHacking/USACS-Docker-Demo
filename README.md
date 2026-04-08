# Docker Demo

A simple tire inventory app built with a static frontend, a Flask API, and PostgreSQL, all run with Docker Compose.

## Stack
- Frontend: HTML, CSS, JavaScript, served by Nginx
- Backend: Python, Flask, Flask-CORS, psycopg2-binary
- Database: PostgreSQL

## Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)

## Run
```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

To stop everything:
```bash
docker compose down
```

## Ports
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## Services
- `frontend` (Nginx): serves static files from `frontend/`
- `backend` (Flask): provides tire inventory APIs on port `5000`
- `db` (PostgreSQL): initializes schema and seed data from `database/init.sql`

## API Endpoints
- `GET /api/tires`
	- Returns all tires ordered by ID
- `POST /api/tires/add`
	- Creates a new tire
	- JSON body:
		```json
		{
			"brand": "Goodyear",
			"model": "Eagle F1",
			"size": "245/40R18",
			"quantity": 6
		}
		```
- `POST /api/tires/update-quantity`
	- Updates stock by delta (negative = sell, positive = restock)
	- JSON body:
		```json
		{
			"id": 1,
			"delta": -2
		}
		```
	- If quantity reaches `0`, the tire is removed

## Notes
- Database data is seeded from `database/init.sql`
- In `docker-compose.yaml`, the backend receives a `DATABASE_URL` environment variable
- Current backend code uses a hardcoded database URL in `backend/app.py`
