# Car Rentals

Car rental app with a Django REST API (`backend/`) and a React + Vite frontend (`frontend/`).

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # then fill in values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- API: http://127.0.0.1:8000/api/
- API docs (Swagger): http://127.0.0.1:8000/api/docs/
- Admin: http://127.0.0.1:8000/admin/

Leave `DATABASE_URL` empty to use SQLite, or set it to a PostgreSQL URL.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Runs at http://localhost:5173.
