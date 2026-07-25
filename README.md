# Server — Narrative-Based Persuasive Intervention (V1 Research Prototype)

Backend API for the MSc research prototype "Designing a Narrative-Based
Persuasive Intervention for Reducing Problematic Smartphone Use Among
University Students." Node.js + Express + TypeScript + MongoDB (Mongoose).

This is a **V1 research prototype**, not a commercial product. See
"Ethics/privacy constraints" below and `../docs/ARCHITECTURE.md` for the
full shared contract with the mobile client.

## Tech stack

- Node.js + Express + TypeScript
- MongoDB via Mongoose
- JWT auth (`jsonwebtoken`) + `bcryptjs` password hashing
- `helmet`, `cors`, `dotenv`
- Validation via `zod`
- Tests: `jest` + `ts-jest` + `supertest` (+ `mongodb-memory-server` where available)

## Install

```bash
cd server
npm install
```

## Environment setup

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Var              | Required | Default (dev)                              | Notes                                      |
|------------------|----------|---------------------------------------------|---------------------------------------------|
| `PORT`           | no       | `4000`                                      | HTTP port                                   |
| `MONGODB_URI`    | no       | `mongodb://localhost:27017/fouzan-apps`     | MongoDB connection string                   |
| `JWT_SECRET`     | **yes**  | —                                            | App throws a clear error at boot if unset   |
| `JWT_EXPIRES_IN` | no       | `7d`                                         | e.g. `7d`, `24h`, `3600` (seconds)          |
| `NODE_ENV`       | no       | `development`                               | `development` \| `test` \| `production`     |
| `CORS_ORIGIN`    | no       | `*` (dev only)                              | Comma-separated allowlist, e.g. `https://app.example.com,https://admin.example.com` |

`CORS_ORIGIN=*` is only intended for local development. In production, set
it to an explicit comma-separated allowlist.

## Run in development

Requires a running MongoDB instance reachable at `MONGODB_URI`.

```bash
npm run dev
```

Starts the server with `ts-node-dev` (auto-restarts on file changes).
Health check: `GET http://localhost:4000/health`.

## Seed demo data

Two equivalent ways to create the demo user + sample usage logs:

1. **Standalone script** (connects to `MONGODB_URI` directly, exits when done):

   ```bash
   npm run seed
   ```

2. **Dev-only HTTP endpoint** (only reachable when `NODE_ENV !== production`;
   returns 404 in production):

   ```bash
   curl -X POST http://localhost:4000/api/v1/dev/seed
   ```

Both call the same `seedDemoData()` function (`src/seed/seedData.ts`), so
they never drift apart. Re-running is idempotent — it upserts the demo user
and replaces their sample logs.

**Demo credentials created by the seed:**

```
email:    demo@example.com
password: Passw0rd!
```

The seeded user has settings (`promptMode: 'compare'`, `thresholdMinutes: 10`),
3 selected apps (`instagram`, `tiktok`, `youtube`), and ~15 `UsageLog` rows
spread across the last few days with a mix of `promptType`/`userAction`
values.

## Run tests

```bash
npm test
```

Runs the full Jest suite (unit + integration) via `ts-jest`, in-band.

> **Note on integration tests:** `mongodb-memory-server` needs to download a
> real MongoDB server binary for the host platform. On some sandboxes/CI
> runners (e.g. aarch64 Linux, where MongoDB does not publish official
> server binaries for every distro/version combination) that download will
> fail. To keep the suite fully self-contained and runnable without a live
> MongoDB, the integration tests mock the Mongoose model layer
> (`jest.mock('../../src/models/...')`) and exercise the real Express app —
> real routing, middleware, validation, auth, and controllers/services — via
> `supertest`. Only the persistence layer is faked. If your environment can
> successfully download a MongoDB binary, `mongodb-memory-server` is still a
> devDependency and can be wired into a true DB-backed test if you extend
> the suite.

## Typecheck

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

Compiles TypeScript to `dist/` via `tsc`.

## Run in production

```bash
npm run build
NODE_ENV=production npm start
```

`npm start` runs `node dist/server.js` (connects to MongoDB, then
listens on `PORT`). Make sure `.env` (or your process manager's env) sets
`JWT_SECRET`, `MONGODB_URI`, `CORS_ORIGIN`, and `NODE_ENV=production`.

## Deploy on Render

This repo includes a `render.yaml` blueprint so you can create the service
with the same build/start settings every time.

1. Push this repo to GitHub.
2. In Render, choose **New** → **Blueprint** and connect this repository.
3. Render will read `render.yaml` and create the web service.
4. Set the secret environment variables in the Render dashboard:
  - `MONGODB_URI` from your Atlas cluster
  - `JWT_SECRET`
5. Keep `NODE_ENV=production` and `JWT_EXPIRES_IN=7d`.
6. After deploy, check `GET /health` on the Render URL.

For a native APK client, the API URL should point to the Render service. If
you also have a browser-based client, tighten `CORS_ORIGIN` to the exact
frontend origin before going beyond personal testing.

## API overview

Base path: `/api/v1`. Full contract lives in `../docs/ARCHITECTURE.md`. Quick
summary:

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /profile`, `PUT /profile`
- `GET /settings`, `PUT /settings`
- `GET /apps`, `PUT /apps`
- `POST /logs`, `GET /logs`
- `GET /prompts/history` (server-side filter over `UsageLog`, not a
  separate collection — see comment in `src/services/logService.ts`)
- `POST /dev/seed` (blocked outside development)
- `GET /health` (plain, outside `/api/v1`)

All authenticated routes require `Authorization: Bearer <jwt>` and scope
data access to the requesting user (`req.user.id` from the JWT) — a userId
in the request body is never trusted.

Response envelope:

```json
{ "success": true, "data": { } }
```

```json
{ "success": false, "message": "…", "errors": ["optional field errors"] }
```

## Ethics / privacy constraints (V1)

- No participant research-data collection: no message, notification, typed
  text, website content, screenshot, contact, or media capture — these
  fields do not exist anywhere in the schema.
- Logging is minimal and purpose-limited to: `timestamp`, `app`, `duration`,
  `promptType`, `userAction` (+ `userId`, `sessionId`, `sourcePlatform`,
  `triggerReason`, `createdAt`, `updatedAt`).
- The dev-only seed endpoint (`POST /dev/seed`) responds `404` when
  `NODE_ENV=production`.

## Common errors

- **`Missing required environment variable JWT_SECRET`** — copy
  `.env.example` to `.env` and set a value for `JWT_SECRET`.
- **`MongoNetworkError` / connection refused on `npm run dev`** — make sure
  MongoDB is running and `MONGODB_URI` points to it. Tests do not need this
  (see note above); only `npm run dev` / `npm run seed` / `npm start` do.
- **`404` from `POST /dev/seed` or `/api/v1/dev/seed`** — expected when
  `NODE_ENV=production`. Use `NODE_ENV=development` (or unset) locally.
- **`401 Invalid or expired token`** — check the `Authorization: Bearer
  <token>` header is present and the token was issued by this same
  `JWT_SECRET` (tokens don't survive a `JWT_SECRET` rotation).
