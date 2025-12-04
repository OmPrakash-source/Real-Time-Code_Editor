# Yjs + Monaco Collaboration Demo

This is a standalone demo of real-time collaboration using Yjs and Monaco Editor.

## How to Run

1.  **Navigate to the directory**:
    ```bash
    cd yjs-collab
    ```

2.  **Start the Server**:
    ```bash
    node server.js
    ```
    The server will start on `ws://localhost:1234`.

3.  **Open the Client**:
    - Open `client.html` in your browser.
    - You can simply double-click the file in your file explorer, or serve it using a local server (e.g., `npx http-server`).

4.  **Test Collaboration**:
    - Open `client.html` in a second browser window or tab.
    - Type in one editor and watch it sync to the other in real-time.
