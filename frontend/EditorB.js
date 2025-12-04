/**
 * EditorB - Screen B Editor Instance
 * Manages the right/second editor panel
 */

let editorB = null;
let currentRoomIdB = null;

function initEditorB(roomId, initialCode = '', language = 'javascript') {
    if (editorB) {
        editorB.applyRemoteCode(initialCode);
        editorB.setLanguage(language);
        editorB.setRoomId(roomId);
    } else {
        const socket = window.socketInstance || io();
        editorB = new EditorComponent('B', 'editorContainerB', roomId, socket);
        editorB.init(initialCode, language);
    }
    currentRoomIdB = roomId;
    return editorB;
}

function getEditorBValue() {
    return editorB ? editorB.getValue() : '';
}

function setEditorBLanguage(language) {
    if (editorB) {
        editorB.setLanguage(language);
    }
}

// Socket event listeners for Editor B
window.addEventListener('socket:load_codeB', (e) => {
    const code = e.detail;
    if (editorB) {
        editorB.applyRemoteCode(code);
    }
});

window.addEventListener('socket:code_update_B', (e) => {
    const code = e.detail;
    if (editorB) {
        editorB.applyRemoteCode(code);
    }
});

window.addEventListener('socket:cursor_update_B', (e) => {
    const { userId, cursor } = e.detail || {};
    if (editorB && userId && cursor) {
        editorB.applyRemoteCursor(userId, cursor);
    }
});

window.editorB = {
    init: initEditorB,
    getValue: getEditorBValue,
    setLanguage: setEditorBLanguage
};
