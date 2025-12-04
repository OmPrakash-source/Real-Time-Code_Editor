/**
 * EditorA - Screen A Editor Instance
 * Manages the left/first editor panel
 */

let editorA = null;
let currentRoomIdA = null;

function initEditorA(roomId, initialCode = '', language = 'javascript') {
    if (editorA) {
        editorA.applyRemoteCode(initialCode);
        editorA.setLanguage(language);
        editorA.setRoomId(roomId);
    } else {
        const socket = window.socketInstance || io();
        editorA = new EditorComponent('A', 'editorContainerA', roomId, socket);
        editorA.init(initialCode, language);
    }
    currentRoomIdA = roomId;
    return editorA;
}

function getEditorAValue() {
    return editorA ? editorA.getValue() : '';
}

function setEditorALanguage(language) {
    if (editorA) {
        editorA.setLanguage(language);
    }
}

// Socket event listeners for Editor A
window.addEventListener('socket:load_codeA', (e) => {
    const code = e.detail;
    if (editorA) {
        editorA.applyRemoteCode(code);
    }
});

window.addEventListener('socket:code_update_A', (e) => {
    const code = e.detail;
    if (editorA) {
        editorA.applyRemoteCode(code);
    }
});

window.addEventListener('socket:cursor_update_A', (e) => {
    const { userId, cursor } = e.detail || {};
    if (editorA && userId && cursor) {
        editorA.applyRemoteCursor(userId, cursor);
    }
});

window.editorA = {
    init: initEditorA,
    getValue: getEditorAValue,
    setLanguage: setEditorALanguage
};
