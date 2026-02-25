# OpportunityChat Backend

Real-time messaging API for opportunity-scoped chat rooms in the insurance workflow. Built with Node.js, Express, Socket.io, and MongoDB/DocumentDB.

## Tech Stack

- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Real-time:** Socket.io (WebSocket)
- **Database:** MongoDB / AWS DocumentDB
- **Authentication:** JWT (internal tokens)
- **File Uploads:** Multer (memory buffer) + E3 Files API proxy
- **Security:** Helmet, CORS
- **Package Manager:** pnpm

## External Service Requirements

| Service | Purpose | Required |
|---------|---------|----------|
| MongoDB / AWS DocumentDB | Data storage (messages, users, opportunities) | Yes |
| E3 Files API | File upload storage | Yes (for file uploads) |
| E3 Auth API | Parent app token validation | No (optional, for integration) |

## Environment Variables

All variables are **run time** unless noted otherwise.

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No (default: 3001) | `3001` |
| `MONGODB_URI` | MongoDB/DocumentDB connection string | Yes | `mongodb://user:pass@host:27017/chat_app_db` |
| `CORS_ORIGIN` | Allowed frontend origin | No (default: `*`) | `https://chat.example.com` |
| `JWT_SECRET` | Secret for signing internal JWT tokens | Yes | `your-secure-random-string` |
| `E3_FILES_API_BASE` | E3 Files API base URL | Yes | `https://e3-auth-api.thor.healthintech.net/` |
| `MAX_FILE_SIZE` | Max upload size in bytes | No (default: 104857600) | `104857600` |
| `LOG_LEVEL` | Logging level | No (default: `info`) | `info`, `debug`, `warn`, `error` |
| `AUTH_API_BASE` | E3 Auth API base URL (enables token exchange) | No | `https://e3-auth-api.thor.healthintech.net/` |
| `AUTH_API_APP_NAME` | App identifier for Auth API header | No (default: `e3_messaging`) | `e3_messaging` |
| `PARENT_APP_ORIGIN` | Parent app origin for CSP frame-ancestors | No | `https://parent-app.example.com` |
| `SEED_ON_START` | Seed sample data on startup | No (default: `false`) | `true` |

### DocumentDB Connection

For AWS DocumentDB, include TLS params in `MONGODB_URI`:

```
mongodb://user:pass@docdb-cluster.region.docdb.amazonaws.com:27017/chat_app_db?tls=true&tlsCAFile=/app/certs/global-bundle.pem&retryWrites=false&readPreference=secondaryPreferred
```

The AWS RDS CA bundle (`global-bundle.pem`) must be available at the specified path. Download from: https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

## Running the Application

```bash
# Install dependencies
pnpm install

# Development (with hot reload)
pnpm dev

# Production
pnpm start

# Seed sample data (for initial testing)
pnpm seed
```

The server starts on the port specified by `PORT` (default 3001).

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/login` | Internal JWT login (standalone) | No |
| POST | `/api/auth/token-exchange` | Exchange parent token for internal JWT | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/users` | List all users | No |
| GET | `/api/users/me` | Current user | Yes |
| GET | `/api/users/:id` | User by ID | Yes |
| GET | `/api/opportunities` | User's opportunities | Yes |
| GET | `/api/opportunities/:id` | Opportunity details | Yes |
| PATCH | `/api/opportunities/:id` | Update opportunity status | Yes |
| GET | `/api/messages/opportunities/:oppId/messages` | Paginated messages | Yes |
| POST | `/api/messages/opportunities/:oppId/messages` | Send message (REST) | Yes |
| GET | `/api/messages/opportunities/:oppId/export` | Export chat as JSON | Yes |
| POST | `/api/files/upload` | Upload file via E3 Files API | Yes |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `authenticate` | Client -> Server | Authenticate with JWT token |
| `authenticated` | Server -> Client | Auth success with user data |
| `send_message` | Client -> Server | Send a message |
| `new_message` | Server -> Client | New message broadcast |
| `mark_read` | Client -> Server | Mark messages as read |
| `message_delivered` | Server -> Client | Delivery confirmation |
| `message_read` | Server -> Client | Read receipt |
| `typing_start` / `typing_stop` | Both | Typing indicators |
| `join_opportunity` / `leave_opportunity` | Client -> Server | Room management |
| `presence_update` | Server -> Client | User online/offline |
| `room_state` | Server -> Client | Room state on join |
| `unread_update` | Server -> Client | Unread count change |

## Testing Phases

### Phase 1 — Standalone Testing

The application runs independently with mock authentication and seed data. No parent app or E3 API integration required.

**Setup:**
1. Copy `.env.example` to `.env` and configure `MONGODB_URI` and `JWT_SECRET`
2. Run `pnpm seed` to populate sample users, opportunities, and messages
3. Run `pnpm dev` to start the backend
4. Start the frontend — navigate to `/login` and select a user from the list

**What can be tested:**
- Mock login (select user from pre-seeded user list)
- Real-time messaging between multiple users (open multiple browser tabs)
- Typing indicators and presence (online/offline status)
- Read receipts and delivery confirmations
- Opportunity-scoped chat rooms with participant management
- Message pagination and chat export
- File upload UI flow (upload dialog, file selection, preview) — the upload request will return 502/501 since E3 Files API is not reachable locally

### Phase 2 — Integrated Testing (Parent App + E3 APIs)

The application runs as an embedded iframe inside the E3 parent app. Authentication flows through E3 Auth API token exchange.

**Setup:**
1. Set `AUTH_API_BASE`, `AUTH_API_APP_NAME`, and `PARENT_APP_ORIGIN` in backend `.env`
2. Set `VITE_PARENT_APP_ORIGIN` in frontend `.env`
3. Parent app embeds the chat frontend via iframe and sends auth token via `postMessage`

**What can be tested:**
- Token exchange flow — parent app sends E3 token, backend validates via `authorize_user/`, issues internal JWT
- User auto-creation from E3 Auth API response (no manual seed data needed)
- File uploads end-to-end via E3 Files API (`import_file/` endpoint)
- Embedded chat views (`/embed/chat` and `/embed/chat/:opportunityId`)
- postMessage communication between parent app and chat iframe
- Full auth flow without mock login page

## Project Structure

```
src/
  config/         # Configuration and database connection
  middleware/     # Auth, upload, error handling
  models/         # Mongoose schemas (User, Message, Opportunity)
  routes/         # Express API routes
  services/       # Presence tracking service
  socket/         # Socket.io initialization and event handlers
  seed/           # Sample data seeder
  utils/          # Logger utility
```
