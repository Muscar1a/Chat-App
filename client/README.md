# Chat-App Frontend (React + Vite)

React/TypeScript client for the Chat-App. It handles auth, password reset, profile screens, and real-time private messaging via WebSocket.

## Getting started
1. Install dependencies: `npm ci`
2. Configure the API base URL in `client/.env`:
   ```
   VITE_API_URL=http://localhost:8000
   ```
3. Run the dev server: `npm run dev -- --host --port 5173`

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – type-check and build (currently fails on unused variable errors in existing code)
- `npm run lint` – ESLint check

## API/WebSocket endpoints
- REST calls use `VITE_API_URL` (defaults to `http://localhost:8000`)
- Chat WebSocket: `ws://<API_HOST>/ws/chat/private/<chat_id>?token=<jwt>`

For backend setup and full project context, see the root `README.md`.
