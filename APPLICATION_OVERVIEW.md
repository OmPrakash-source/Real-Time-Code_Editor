# Application Overview: Real-Time Collaborative Code Editor

This document provides a comprehensive view of the real-time collaborative code editor application. It details the architecture, file structure, and key functionalities of the system.

## 1. High-Level Architecture

The application acts as a real-time collaborative platform where multiple users can join a "room" and edit code simultaneously. It supports multiple programming languages and allows users to modify code, change languages, and compile/run their code.

-   **Frontend**: Built with vanilla HTML, CSS, and JavaScript. It uses **Monaco Editor** (the code editor that powers VS Code) for the editing interface.
-   **Backend**: A **Node.js** server using **Express** for API routes and **Socket.IO** for real-time bidirectional communication.
-   **Database**: **MongoDB** is used to persist room states, file contents, and user sessions.
-   **Compilation**: Code execution is handled essentially via an external API (Judge0) through the backend.

## 2. Directory Structure

### Root Directory
-   **.env**: Environment variables (Port, MongoDB URI, Judge0 URL).
-   **server.js** (in `backend/` but referenced): Main entry point for the backend server.
-   **README.md**: Setup instructions.
-   **package.json**: Project dependencies and scripts.

### Backend (`/backend`)
Contains all server-side logic.
-   **server.js**:
    -   Initializes the Express app and HTTP server.
    -   Sets up Socket.IO with CORS.
    -   Connects to MongoDB.
    -   Runs a cron job every 15 minutes to clean up old files and empty rooms.
    -   Serves static frontend files and API routes.
-   **socket.js**: Handles specific Socket.IO events (connection, joining rooms, code changes, cursor movements).
-   **routes/**:
    -   `room.js`: API endpoints for creating and checking rooms.
    -   `compile.js`: API endpoint (`POST /compile`) to send code execution requests to the Judge0 service.
-   **models/**: MongoDB Mongoose models.
    -   `Room.js`: Stores room metadata (members, current language).
    -   `File.js`: Stores the actual code content for a room.
    -   `UserSession.js`: Tracks active user sessions in rooms.
-   **compiler/**:
    -   `judge0.js`: Helper module to interact with the Judge0 API for compiling code.

### Frontend (`/frontend`)
Contains the client-side user interface.
-   **index.html**: The main structure of the page (buttons, editor containers, input/output areas).
-   **style.css**: Styling for the dark-themed UI.
-   **app.js**: Main client logic.
    -   Handles UI interactions (buttons, dropdowns).
    -   Initializes Monaco Editor instances (Split view: Editor A and Editor B).
    -   Manages room creation and joining via fetch APIs.
    -   Listens to Socket.IO events to update the editor content in real-time.
-   **socket.js**: A lightweight wrapper around the Socket.IO client. It exposes methods to emit events and dispatches incoming socket events as DOM `CustomEvents` for `app.js` to consume.
-   **EditorA.js / EditorB.js** / **EditorComponent.js**: Likely helper scripts or configurations for the Monaco editor instances (based on file naming).

## 3. Key Features & Workflows

### 3.1. Real-Time Collaboration
-   **Joining**: When a user enters a room ID, they join a Socket.IO room.
-   **Syncing**:
    -   **Code**: When a user types, `app.js` captures the change and emits a `code_change` event via `socket.js`. The server broadcasts this to other users in the room, updating their editors.
    -   **Cursors**: Cursor positions are synced to show where other users are typing.
    -   **Language**: Changing the programming language (e.g., Python to C++) emits a `language_change` event, updating the editor syntax highlighting for everyone in the room.

### 3.2. Code Compilation
1.  User clicks "Run Code".
2.  Frontend collects code, language, and standard input (stdin).
3.  Sends a `POST` request to `/compile`.
4.  Backend forwards this to the execution service (Judge0).
5.  Results (stdout, stderr, memory, time) are returned to the frontend and displayed in the "Output" section.

### 3.3. Room & Data Management
-   **Persistence**: Room states and code are saved to MongoDB. If users leave and return, the state is preserved (until the cleanup job runs).
-   **Cleanup**: A cron job runs every 15 minutes to delete files and rooms that haven't been active for a configured period (default 6 hours), ensuring the database doesn't grow indefinitely with stale data.

## 4. Technology Stack Summary

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Server-side JavaScript runtime. |
| **Framework** | Express.js | Web framework for routing and middleware. |
| **Real-time** | Socket.IO | library for real-time, bidirectional communication. |
| **Database** | MongoDB | NoSQL database for storing code and room data. |
| **ORM** | Mongoose | Object modeling tool for MongoDB. |
| **Editor** | Monaco Editor | The code editor component (same as VS Code). |
| **Compiler** | Judge0 | External API/Service for executing code. |

## 5. Deployment & Setup
The application is designed to run locally or on a server.
-   **Dependencies**: `npm install`
-   **Environment**: Requires `.env` with DB URI and API keys.
-   **Start**: `npm run dev` starts the server (typically on port 4000), which serves both the API and the static frontend assets.
