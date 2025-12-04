// server.js
// Minimal y-websocket server. Run with: node server.js
// npm install y-websocket ws

const http = require('http');
const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const PORT = process.env.PORT || 1234;
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Yjs websocket server\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
    // setupWSConnection handles Yjs protocol, awareness, docs in-memory
    setupWSConnection(conn, req, { gc: true });
});

server.listen(PORT, () => {
    console.log(`y-websocket server listening on ws://localhost:${PORT}`);
});
