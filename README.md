# Docker Demo

A simple tire inventory app built with a static frontend, a Flask API, and PostgreSQL, all run with Docker Compose.

## Stack
- Frontend: HTML, CSS, JavaScript, served by Nginx
- Backend: Python, Flask, Flask-CORS, psycopg2-binary
- Database: PostgreSQL

## Run
```bash
docker compose up --build
```

## Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Notes
- Database data is seeded from `database/init.sql`
- The backend reads the database connection from `DATABASE_URL`
