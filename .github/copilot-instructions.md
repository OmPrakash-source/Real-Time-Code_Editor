# Copilot Instructions for Real-Time Collaborative Code Editor

## Project Architecture
- **Frontend** (`/frontend`): Vanilla JS, HTML, CSS, and Monaco Editor. Handles UI, code editing, and real-time updates via Socket.IO. Key files: `app.js`, `socket.js`, `EditorA.js`, `EditorB.js`, `EditorComponent.js`.
- **Backend** (`/backend`): Node.js with Express and Socket.IO. Handles API routes, real-time events, and database operations. Key files: `server.js`, `socket.js`, `routes/`, `models/`, `compiler/judge0.js`.
- **Database**: MongoDB (via Mongoose). Models: `Room`, `File`, `UserSession`.
- **Code Execution**: Integrates with Judge0 API for code compilation and execution.

## Data Flow & Real-Time Collaboration
- Users join rooms via Socket.IO (`join_room`).
- Code, cursor, and language changes are broadcast in real time to all room members.
- Code is periodically saved to MongoDB (debounced, see backend `socket.js`).
- Room and file state is persisted; a cron job cleans up inactive rooms/files every 15 minutes.

## Developer Workflows
- **Setup**: `npm install` (root), ensure MongoDB is running, then `npm run dev`.
- **Environment**: `.env` file required (see `README.md` for example values).
- **Start**: `npm run dev` (serves both backend and static frontend).
- **Testing**: No explicit test suite; manual testing via browser and API endpoints.
- **Debugging**: Use console logs in both backend and frontend. Socket events are key for tracing real-time issues.

## Project-Specific Patterns & Conventions
- **Room Management**: Each room has a unique ID; users are tracked via `UserSession`.
- **Dual Editor Support**: `EditorA` and `EditorB` are initialized for split view; code for each is managed separately.
- **Socket Event Pattern**: All real-time updates (code, cursor, language) use Socket.IO events, relayed as DOM `CustomEvents` on the frontend.
- **API Endpoints**: `/room` for room management, `/compile` for code execution (forwards to Judge0).
- **Cleanup**: Cron job in backend (`server.js`) deletes old files/rooms (default expiry: 6 hours).

## Integration Points
- **Judge0 API**: Used for code compilation. See `backend/compiler/judge0.js` and `/compile` route.
- **MongoDB**: Stores all persistent state (rooms, files, sessions).
- **Monaco Editor**: Used for code editing UI; language is mapped via `MONACO_LANGUAGE_MAP` in `frontend/app.js`.

## Examples
- To add a new language, update `MONACO_LANGUAGE_MAP` (frontend) and ensure Judge0 supports it.
- To add a new real-time event, define it in both backend `socket.js` and frontend `socket.js`.
- For persistent data, always update the relevant Mongoose model in `backend/models/`.

## Key Files/Directories
- `backend/server.js`: App entry, Express/Sockets, cron cleanup
- `backend/socket.js`: Real-time event logic, debounced saves
- `backend/routes/compile.js`: Judge0 integration
- `frontend/app.js`: Main UI logic, room/language management
- `frontend/socket.js`: Socket event wrapper and DOM event relay
- `README.md` and `APPLICATION_OVERVIEW.md`: High-level docs and setup

---
For more details, see the above files and documentation. If a pattern or workflow is unclear, check for comments in the relevant file or ask for clarification.
