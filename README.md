# Chat-App

Full-stack chat platform with a FastAPI backend and a React/TypeScript frontend. It supports private messaging over WebSocket, JWT-based authentication with refresh and password reset flows, and profile management.

## Features
- JWT auth with refresh tokens, online/offline tracking, and rate-limited login/reset flows
- Password reset via email with token expiry and reuse protection
- Private chats with real-time updates over WebSocket and end-to-end encryption helpers
- Profile management: avatars, basic details, settings, and account deletion/export endpoints
- MongoDB persistence via Motor/Beanie and FastAPI auto-generated docs

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Ant Design
- Backend: FastAPI, Motor/Beanie (MongoDB), python-jose, passlib, slowapi, python-socketio

## Repository Layout
- `client/` – React/Vite frontend
- `server/` – FastAPI backend and WebSocket handlers

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A MongoDB instance and credentials
- SMTP credentials for password reset emails

## Backend Setup (FastAPI)
1. From the repo root: `cd server`
2. Create a virtual environment (example):  
   - Linux/macOS: `python3 -m venv .venv && source .venv/bin/activate`  
   - Windows: `py -m venv .venv && .venv\\Scripts\\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create a `.env` file in `server/` with values for the required settings:

```
ENVIRONMENT=development
ALLOWED_ORIGINS=*

MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=chat_app
USERS_COLLECTION=users

SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=change-me
EMAIL_FROM=no-reply@example.com

FRONTEND_URL=http://localhost:5173
```

5. Start the API: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
6. Docs: visit `http://localhost:8000/docs` (Swagger) or `/redoc`.

## Frontend Setup (React/Vite)
1. From the repo root: `cd client`
2. Install dependencies: `npm ci`
3. Create `client/.env` (Vite uses this file) with the API base URL:

```
VITE_API_URL=http://localhost:8000
```

4. Start the dev server: `npm run dev -- --host --port 5173`
5. Build/lint scripts:
   - `npm run build`
   - `npm run lint`

The WebSocket endpoint is `ws://<API_HOST>/ws/chat/private/<chat_id>?token=<jwt>`. Use the same host/port as `VITE_API_URL`.

## Running the app locally
1. Start the backend (FastAPI on port 8000).
2. Start the frontend (Vite on port 5173).
3. Open `http://localhost:5173` and log in/register, then open `/message` to chat.

## Notes
- The client build currently fails due to unused variable TypeScript errors in existing code; no code changes were made in this update.
- Ensure MongoDB and SMTP credentials are valid before invoking password reset flows.
