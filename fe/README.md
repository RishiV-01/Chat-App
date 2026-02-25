# OpportunityChat Frontend

Real-time messaging UI for opportunity-scoped chat rooms. Built with React, Socket.io, Zustand, and Tailwind CSS.

## Tech Stack

- **Framework:** React 18 with Vite
- **Real-time:** Socket.io Client
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Package Manager:** pnpm

## External Service Requirements

| Service | Purpose | Required |
|---------|---------|----------|
| OpportunityChat Backend | REST API and WebSocket server | Yes |

## Environment Variables

All variables are **build time** (prefixed with `VITE_`).

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | No (default: `''`) | `https://api.chat.example.com` |
| `VITE_SOCKET_URL` | WebSocket server URL | No (default: `''`) | `https://api.chat.example.com` |
| `VITE_PARENT_APP_ORIGIN` | Parent app origin for postMessage auth | No | `https://parent-app.example.com` |

## Running the Application

```bash
# Install dependencies
pnpm install

# Development (with hot reload and API proxy)
pnpm dev

# Production build
pnpm build

# Preview production build locally
pnpm preview
```

The dev server starts on port 5173 and proxies `/api` and `/socket.io` requests to `http://localhost:3001`.

## Project Structure

```
src/
  api/            # Axios instance and API modules (auth, files, messages, opportunities)
  components/     # React components
    auth/         # Login page
    chat/         # Chat UI (conversation list, message thread, input)
    common/       # Shared components (avatar, badge, modal, spinner)
    embed/        # Embeddable chat views (iframe support)
    layout/       # App shell (sidebar, header)
    opportunities/ # Opportunity list and message modal
  config/         # Environment constants
  hooks/          # Custom hooks (file upload, typing indicators)
  socket/         # Socket.io client manager
  store/          # Zustand stores (auth, chat, presence, UI)
  utils/          # Date and file size formatters
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | User selection login page (standalone testing) |
| `/app` | Main application shell with sidebar |
| `/embed/chat` | Embeddable full chat interface (for iframes) |
| `/embed/chat/:opportunityId` | Embeddable single conversation (for iframes) |

## Testing Phases

### Phase 1 — Standalone Testing

The frontend runs with the backend's mock login and seed data. No parent app integration needed.

**Setup:**
1. Start the backend (`pnpm dev` in `be/`)
2. Run `pnpm dev` in `fe/` — opens on `http://localhost:5173`
3. Navigate to `/login` and select a user

**What can be tested:**
- Login page with user selection from seed data
- Opportunity list with unread message counts
- Real-time messaging (open multiple tabs with different users)
- Rich text message input
- Typing indicators and online/offline presence
- Read receipts and delivery confirmations
- File upload UI (file picker, preview modal) — upload will fail since E3 Files API is not reachable locally
- Chat export
- Responsive layout and sidebar navigation

### Phase 2 — Integrated Testing (Embedded in Parent App)

The frontend runs inside the E3 parent app as an iframe. Authentication happens via `postMessage`.

**Setup:**
1. Set `VITE_PARENT_APP_ORIGIN` in `.env` to the parent app's origin
2. Build with `pnpm build` and deploy
3. Parent app loads the chat via `/embed/chat` or `/embed/chat/:opportunityId`

**What can be tested:**
- postMessage token exchange between parent app and chat iframe
- Automatic login without the mock login page
- Embedded chat views (`/embed/chat`, `/embed/chat/:opportunityId`)
- File uploads end-to-end via E3 Files API
- All messaging features within the embedded context
