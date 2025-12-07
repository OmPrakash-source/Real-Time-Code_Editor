# Real-time Collaborative Code Editor

A real-time collaborative code editor built with Node.js, Socket.IO, MongoDB, and Monaco Editor.

## Prerequisites

- **Node.js**: [Download & Install](https://nodejs.org/)
- **MongoDB**: [Download & Install](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas)

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    The `.env` file is already created with default settings:
    ```env
    PORT=4000
    MONGODB_URI=mongodb://127.0.0.1:27017/realtime-code-editor
    JUDGE0_URL=https://judge0-ce.p.rapidapi.com
    ```

3.  **Start Database**
    Ensure MongoDB is running locally:
    ```bash
    mongod
    ```

4.  **Start Server**
    ```bash
    npm run dev
    ```

5.  **Access App**
    Open [http://localhost:4000](http://localhost:4000) in your browser.

## Features

- Real-time code collaboration
- Multi-language support (C, C++, Java, Python, JavaScript)
- Code compilation via Judge0 API
- Room management

cd C:\Users\omjha\OneDrive\Desktop\The\project-root
npm run dev

🟢 Green (#d4edda) - Start/user actions
🟡 Yellow (#fff3cd) - Active/processing states
🔵 Blue (#cce5ff) - Results/output
🔴 Red (#ffe1e1, #f8d7da) - Database/end states