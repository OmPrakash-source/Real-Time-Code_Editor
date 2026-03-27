/**
 * Main Application Logic
 * Handles room management, language switching, and compilation
 */

let currentRoomId = null;
let currentUserId = null;

const MONACO_LANGUAGE_MAP = {
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
    php: 'php'
};

/**
 * Generate or retrieve user ID from localStorage
 */
function getOrCreateUserId() {
    const key = 'realtime_editor_user_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = generateRandomId(12);
        localStorage.setItem(key, id);
    }
    return id;
}

function generateRandomId(len = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
}

/**
 * Update room label in UI
 */
function setCurrentRoomLabel(roomId) {
    const label = document.getElementById('currentRoomLabel');
    if (!label) return;
    label.textContent = roomId ? `Room: ${roomId}` : '';
}

/**
 * Initialize Monaco editors
 */
function initMonacoEditors(language = 'javascript') {
    window.require.config({
        paths: {
            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
        }
    });

    window.require(['vs/editor/editor.main'], () => {
        if (currentRoomId) {
            window.editorA.init(currentRoomId, '', language);
            window.editorB.init(currentRoomId, '', language);
        } else {
            // Local-only mode (no room joined yet)
            window.editorA.init('local', '', language);
            window.editorB.init('local', '', language);
        }
    });
}

/**
 * Create a new room
 */
async function createRoom(language) {
    try {
        const res = await fetch('/room/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language })
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Failed to create room');
            return null;
        }

        const data = await res.json();
        return data.roomId;
    } catch (err) {
        alert('Network error while creating room');
        return null;
    }
}

/**
 * Join a room
 */
function joinRoom(roomId, language) {
    if (!roomId) {
        alert('Enter a room ID');
        return;
    }

    currentRoomId = roomId;
    setCurrentRoomLabel(roomId);

    // Join via socket
    window.socketApi.joinRoom({
        roomId,
        userId: currentUserId,
        language
    });

    // Initialize editors with room context
    if (window.editorA && window.editorB) {
        window.editorA.init(roomId, '', language);
        window.editorB.init(roomId, '', language);
    }
}

/**
 * Compile code from selected editor
 */
async function compileCode() {
    const activeEditorSelect = document.getElementById('activeEditorSelect');
    const languageSelect = document.getElementById('languageSelect');
    const stdinEl = document.getElementById('stdinInput');
    const stdoutEl = document.getElementById('stdout');
    const stderrEl = document.getElementById('stderr');
    const execMetaEl = document.getElementById('executionMeta');

    const editorId = activeEditorSelect.value; // 'A' or 'B'
    const language = languageSelect.value;
    const stdin = stdinEl.value;

    let code = '';
    if (editorId === 'A') {
        code = window.editorA.getValue();
    } else {
        code = window.editorB.getValue();
    }

    if (!code.trim()) {
        alert('Editor is empty');
        return;
    }

    stdoutEl.textContent = '';
    stderrEl.textContent = '';
    execMetaEl.textContent = 'Running...';

    try {
        const res = await fetch('/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, stdin })
        });

        const data = await res.json();
        if (!res.ok) {
            stderrEl.textContent = data.error || 'Compile failed';
            execMetaEl.textContent = '';
            return;
        }

        stdoutEl.textContent = data.stdout || '';
        stderrEl.textContent = data.stderr || '';
        execMetaEl.textContent = `time=${data.time || '-'}s, memory=${data.memory || '-'} KB`;
    } catch (err) {
        stderrEl.textContent = 'Network/Server error';
        execMetaEl.textContent = '';
    }
}

/**
 * Initialize app on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
    currentUserId = getOrCreateUserId();

    const roomIdInput = document.getElementById('roomIdInput');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const languageSelect = document.getElementById('languageSelect');
    const runCodeBtn = document.getElementById('runCodeBtn');

    // Check for room ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');

    if (urlRoomId) {
        roomIdInput.value = urlRoomId;
        initMonacoEditors(languageSelect.value);
        joinRoom(urlRoomId, languageSelect.value);
    } else {
        initMonacoEditors(languageSelect.value);
    }

    // Create room button
    createRoomBtn.addEventListener('click', async () => {
        const language = languageSelect.value;
        const roomId = await createRoom(language);
        if (!roomId) return;

        roomIdInput.value = roomId;
        const params = new URLSearchParams(window.location.search);
        params.set('roomId', roomId);
        window.history.replaceState({}, '', `?${params.toString()}`);
        joinRoom(roomId, language);
    });

    // Join room button
    joinRoomBtn.addEventListener('click', () => {
        const roomId = roomIdInput.value.trim();
        const language = languageSelect.value;
        if (!roomId) {
            alert('Enter a room ID');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        params.set('roomId', roomId);
        window.history.replaceState({}, '', `?${params.toString()}`);
        joinRoom(roomId, language);
    });

    // Language change
    languageSelect.addEventListener('change', () => {
        const language = languageSelect.value;

        if (window.editorA) window.editorA.setLanguage(language);
        if (window.editorB) window.editorB.setLanguage(language);

        if (currentRoomId) {
            window.socketApi.emitLanguageChange(currentRoomId, language);
        }
    });

    // Run code button
    runCodeBtn.addEventListener('click', compileCode);

    // Socket event: language change from remote
    window.addEventListener('socket:language_change', (e) => {
        const { language } = e.detail;
        languageSelect.value = language;
        if (window.editorA) window.editorA.setLanguage(language);
        if (window.editorB) window.editorB.setLanguage(language);
    });

    // Socket event: error message
    window.addEventListener('socket:error_message', (e) => {
        const { message } = e.detail || {};
        if (message) alert(message);
    });
});
