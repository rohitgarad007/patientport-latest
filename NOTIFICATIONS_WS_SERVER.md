# Notifications WebSocket Server (notifications-ws-server.mjs)

This project includes a small Node.js server that provides:

- A WebSocket endpoint for doctor clients: `/ws?doctor_id=...`
- An HTTP publish endpoint for the PHP API to push events: `POST /publish`

File: [notifications-ws-server.mjs](file:///c:/xampp/htdocs/patientport-latest/notifications-ws-server.mjs)

## What problem this solves

Without this server, the doctor navbar (Arrived/Waiting/Draft buttons) only updates after refresh or after calling a “refresh API”.

With this server:

- Backend publishes “something changed” immediately after an appointment/treatment/queue update.
- Doctor UI receives the event instantly over WebSocket and updates the navbar counts without refresh.

## High-level architecture

1. **Doctor browser connects** to the WebSocket server:
   - `wss://YOUR_DOMAIN/ws?doctor_id=123`
2. **PHP API publishes** when something changes:
   - `POST https://YOUR_DOMAIN/publish`
   - body contains `{ doctor_id, event, payload }`
3. **WebSocket server forwards** the event to all active connections for that doctor.

## Endpoints

### WebSocket: `/ws`

- URL format:
  - `/ws?doctor_id=<doctorId>`
- Required query param:
  - `doctor_id`
- If `doctor_id` is missing, server closes with code `1008` and reason `doctor_id required`.

### HTTP Publish: `POST /publish`

- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `X-WS-SECRET: <secret>` (only required if `WS_PUBLISH_SECRET` is set)
- Body (JSON):
  - `doctor_id` (string/number)
  - `event` (string)
  - `payload` (object, optional)

Response:
```json
{ "success": true, "doctor_id": "123", "sent": 2 }
```

`sent` is the number of connected WebSocket clients for that doctor that received the message.

### Health: `GET /health`

Returns server status and number of distinct doctors connected:
```json
{ "ok": true, "doctors": 3 }
```

### Debug: `GET /debug`

Returns a list of doctors and how many active WebSocket connections each has:
```json
{ "ok": true, "doctors": [{ "doctor_id": "123", "connections": 2 }] }
```

## Environment variables

### On the WebSocket server machine

```
WS_NOTIFICATIONS_PORT=8081
WS_PUBLISH_SECRET=your_long_random_secret
```

- `WS_NOTIFICATIONS_PORT`: which port the Node server listens on
- `WS_PUBLISH_SECRET`: optional secret to protect `/publish`

### On the PHP API machine (publisher)

```
WS_NOTIFICATIONS_PUBLISH_URL=http://127.0.0.1:8081/publish
WS_PUBLISH_SECRET=your_long_random_secret
```

Notes:

- `WS_NOTIFICATIONS_PUBLISH_URL` must point to the Node server’s `/publish`.
- `WS_PUBLISH_SECRET` must match the Node server `WS_PUBLISH_SECRET` (same exact value).

## Message format (what the doctor browser receives)

The server broadcasts a JSON string like:

```json
{
  "event": "doctor_appointments_changed",
  "doctor_id": "123",
  "payload": { "type": "appointment_updated", "appointment": { /* ... */ } }
}
```

In this project, the UI listens for:

- `event: "doctor_appointments_changed"`

And uses `payload.type` + `payload.appointment` or `payload.items` to update the navbar state.

## Step-by-step: what happens when appointment status changes

Example flow: staff changes an appointment status to `waiting`.

1. Staff triggers API: `sf_staff_updateAppointmentStatus`
2. API updates DB and builds an appointment object.
3. API publishes to WS server:
   - URL: `WS_NOTIFICATIONS_PUBLISH_URL`
   - event: `doctor_appointments_changed`
   - payload: `{ type: "appointment_updated", appointment_uid, status, date, appointment }`
4. WS server receives `POST /publish`, verifies `X-WS-SECRET` (if enabled), then:
   - finds all sockets for that `doctor_id`
   - sends the JSON message to those sockets
5. Doctor UI receives it and updates the Arrived/Waiting/Draft buttons immediately.

## How the server works internally (code walk)

### 1) Track connected doctor clients

The server stores active WebSocket connections in memory:

- `doctorClients: Map<string, Set<WebSocket>>`

When a doctor connects to `/ws?doctor_id=123`, it adds that WebSocket to the map under `"123"`.

### 2) Publish events

When `POST /publish` is called:

- Reads JSON body
- Validates `doctor_id` and `event`
- Broadcasts `{ event, doctor_id, payload }` to all sockets for that doctor

### 3) Security on `/publish`

If `WS_PUBLISH_SECRET` is set, the server requires:

- Request header `X-WS-SECRET` to match

If not matched, it returns `401 Unauthorized`.

## How to run (development)

From the project root:

```bash
npm install
npm run notifications:ws
```

Expected log:

```
notifications-ws-server listening on http://localhost:8081
```

## How to run (production)

Run it as a background process so it restarts automatically.

### Option 1: PM2 (Linux VPS)

```bash
cd /path/to/patientport-latest
npm ci
npm i -g pm2
pm2 start npm --name notifications-ws -- run notifications:ws
pm2 save
pm2 startup
```

### Option 2: Docker

Run a Node container that starts `node notifications-ws-server.mjs` and expose the chosen port.

## Reverse proxy (HTTPS/WSS)

To serve WSS on your main domain (recommended), proxy these paths to the Node server:

- `/ws` (WebSocket upgrade)
- `/publish` (HTTP POST)

Nginx example:

```nginx
location /ws {
  proxy_pass http://127.0.0.1:8081/ws;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}

location /publish {
  proxy_pass http://127.0.0.1:8081/publish;
  proxy_set_header Host $host;
}
```

Then set frontend build env:

```
VITE_DOCTOR_NOTIFICATIONS_WS_URL=wss://YOUR_DOMAIN/ws
```

## Common issues

### `dc_doctor_getLoggedInProfile` is called repeatedly

That usually happens if the WebSocket server is down/unreachable and the UI reconnect loop keeps trying. Make sure the WS server is running and reachable from the browser.

### Events publish but doctor UI does not update

Check:

1. WS server `/health` returns `{ ok: true }`
2. WS server `/debug` shows the doctor has at least 1 connection
3. PHP API can reach `WS_NOTIFICATIONS_PUBLISH_URL`
4. Frontend is using the correct WSS URL (especially in production)

