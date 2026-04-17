// Simple Socket.IO wrapper for the frontend

const socket = io({
    autoConnect: true
});

// Expose socket instance globally
window.socketInstance = socket;

// Expose a small API via window
const socketApi = {
    joinRoom(payload) {
        socket.emit('join_room', payload);
    },
    leaveRoom(payload) {
        socket.emit('leave_room', payload);
    },
    emitCodeChange(roomId, code) {
        socket.emit('code_change', { roomId, code });
    },
    emitCursorChange(roomId, userId, range) {
        socket.emit('cursor_change', { roomId, userId, range });
    },
    emitLanguageChange(roomId, language) {
        socket.emit('language_change', { roomId, language });
    },
    sendMessage(roomId, userId, text) {
        socket.emit('chat_message', { roomId, userId, text });
    }
};

// Relay incoming events as DOM CustomEvents so editor.js can subscribe

socket.on('init_state', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:init_state', { detail }));
});

socket.on('code_change', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:code_change', { detail }));
});

socket.on('cursor_change', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:cursor_change', { detail }));
});

socket.on('language_change', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:language_change', { detail }));
});

socket.on('user_joined', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:user_joined', { detail }));
});

socket.on('user_left', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:user_left', { detail }));
});

socket.on('error_message', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:error_message', { detail }));
});

// Dual editor events
socket.on('load_codeA', (code) => {
    window.dispatchEvent(new CustomEvent('socket:load_codeA', { detail: code }));
});

socket.on('code_update_A', (code) => {
    window.dispatchEvent(new CustomEvent('socket:code_update_A', { detail: code }));
});

socket.on('cursor_update_A', (cursor) => {
    window.dispatchEvent(new CustomEvent('socket:cursor_update_A', { detail: cursor }));
});

socket.on('load_codeB', (code) => {
    window.dispatchEvent(new CustomEvent('socket:load_codeB', { detail: code }));
});

socket.on('code_update_B', (code) => {
    window.dispatchEvent(new CustomEvent('socket:code_update_B', { detail: code }));
});

socket.on('cursor_update_B', (cursor) => {
    window.dispatchEvent(new CustomEvent('socket:cursor_update_B', { detail: cursor }));
});

socket.on('chat_message', (detail) => {
    window.dispatchEvent(new CustomEvent('socket:chat_message', { detail }));
});

window.socketApi = socketApi;
