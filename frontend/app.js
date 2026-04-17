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

    // Chat logic
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');

    function appendMessage(userId, text, isSelf = false) {
        const li = document.createElement('li');
        li.className = `message ${isSelf ? 'self' : 'other'}`;
        
        const userSpan = document.createElement('span');
        userSpan.className = 'msg-user';
        userSpan.textContent = isSelf ? 'You' : userId;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        
        li.appendChild(userSpan);
        li.appendChild(textSpan);
        
        chatMessages.appendChild(li);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendChatMessage() {
        if (!currentRoomId) {
            alert('Join a room first to chat');
            return;
        }
        const text = chatInput.value.trim();
        if (!text) return;
        
        window.socketApi.sendMessage(currentRoomId, currentUserId, text);
        appendMessage(currentUserId, text, true);
        chatInput.value = '';
    }

    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    window.addEventListener('socket:chat_message', (e) => {
        const { userId, text } = e.detail;
        appendMessage(userId, text, false);
    });

    // Minimize logic
    const minBtnA = document.getElementById('minBtnA');
    const minBtnB = document.getElementById('minBtnB');
    const screenA = document.getElementById('screenA');
    const screenB = document.getElementById('screenB');
    const dualLayout = document.querySelector('.dual-editor-layout');

    let isMinA = false;
    let isMinB = false;

    function adjustMonacoLayout() {
        // give grid transition time to mostly settle
        setTimeout(() => {
            if (window.editorA && window.editorA.editor) window.editorA.editor.layout();
            if (window.editorB && window.editorB.editor) window.editorB.editor.layout();
        }, 300);
    }

    minBtnA.addEventListener('click', () => {
        isMinA = !isMinA;
        if (isMinA) {
            screenA.classList.add('collapsed');
            dualLayout.classList.add('min-a');
            minBtnA.textContent = '+';
        } else {
            screenA.classList.remove('collapsed');
            dualLayout.classList.remove('min-a');
            minBtnA.textContent = '_';
        }
        adjustMonacoLayout();
    });

    minBtnB.addEventListener('click', () => {
        isMinB = !isMinB;
        if (isMinB) {
            screenB.classList.add('collapsed');
            minBtnB.textContent = '+';
        } else {
            screenB.classList.remove('collapsed');
            minBtnB.textContent = '_';
        }
        adjustMonacoLayout();
    });

    // --- Advanced Resizing System ---
    const SplitManager = {
        init() {
            this.loadLayout();
            this.setupResizers();
        },

        loadLayout() {
            const saved = localStorage.getItem('editor_layout');
            if (!saved) return;
            const config = JSON.parse(saved);

            if (config.editors) {
                document.getElementById('screenA').style.flex = config.editors.a;
                document.getElementById('screenB').style.flex = config.editors.b;
            }
            if (config.main) {
                document.getElementById('dualEditorLayout').style.flex = config.main.editors;
                document.getElementById('sidePanel').style.flex = config.main.side;
            }
            if (config.side) {
                document.getElementById('outputPanel').style.flex = config.side.output;
                document.getElementById('chatPanel').style.flex = config.side.chat;
            }
        },

        saveLayout() {
            const config = {
                editors: {
                    a: document.getElementById('screenA').style.flex || 1,
                    b: document.getElementById('screenB').style.flex || 1
                },
                main: {
                    editors: document.getElementById('dualEditorLayout').style.flex || 2,
                    side: document.getElementById('sidePanel').style.flex || 1
                },
                side: {
                    output: document.getElementById('outputPanel').style.flex || 1,
                    chat: document.getElementById('chatPanel').style.flex || 1
                }
            };
            localStorage.setItem('editor_layout', JSON.stringify(config));
        },

        setupResizers() {
            // Screen A | Screen B
            this.addResizer('gutter-editors', 'horizontal', (e, rect) => {
                const a = document.getElementById('screenA');
                const b = document.getElementById('screenB');
                let val = ((e.clientX - rect.left) / rect.width) * 100;
                val = Math.min(Math.max(val, 15), 85);
                a.style.flex = val;
                b.style.flex = 100 - val;
            }, 'dualEditorLayout');

            // Editors | Side Panel
            this.addResizer('gutter-main', 'horizontal', (e, rect) => {
                const editors = document.getElementById('dualEditorLayout');
                const side = document.getElementById('sidePanel');
                let val = ((e.clientX - rect.left) / rect.width) * 100;
                val = Math.min(Math.max(val, 25), 75);
                editors.style.flex = val;
                side.style.flex = 100 - val;
            }, 'mainLayout');

            // Output | Chat
            this.addResizer('gutter-side', 'vertical', (e, rect) => {
                const out = document.getElementById('outputPanel');
                const chat = document.getElementById('chatPanel');
                let val = ((e.clientY - rect.top) / rect.height) * 100;
                val = Math.min(Math.max(val, 15), 85);
                out.style.flex = val;
                chat.style.flex = 100 - val;
            }, 'sidePanel');
        },

        addResizer(id, direction, onDrag, containerId) {
            const gutter = document.getElementById(id);
            if (!gutter) return;

            const container = document.getElementById(containerId);
            let isDragging = false;

            const startDragging = () => {
                isDragging = true;
                document.body.classList.add('resizing-' + direction);
                document.body.style.userSelect = 'none';
            };

            const stopDragging = () => {
                if (!isDragging) return;
                isDragging = false;
                document.body.classList.remove('resizing-' + direction);
                document.body.style.userSelect = 'auto';
                this.saveLayout();
            };

            gutter.addEventListener('mousedown', startDragging);
            
            // Double click to equalize
            gutter.addEventListener('dblclick', () => {
                const elements = direction === 'horizontal' ? 
                    [container.firstElementChild, container.lastElementChild] :
                    [container.firstElementChild, container.lastElementChild];
                elements[0].style.flex = 1;
                elements[1].style.flex = 1;
                this.saveLayout();
                adjustMonacoLayout();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const rect = container.getBoundingClientRect();
                onDrag(e, rect);
                adjustMonacoLayout();
            });

            document.addEventListener('mouseup', stopDragging);
        }
    };

    SplitManager.init();

});
