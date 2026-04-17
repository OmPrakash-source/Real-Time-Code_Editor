/**
 * EditorComponent - Reusable Monaco Editor Component
 * Handles editor initialization, socket events, and cursor synchronization
 */

class EditorComponent {
    constructor(editorId, containerId, roomId, socket) {
        this.editorId = editorId; // 'A' or 'B'
        this.containerId = containerId;
        this.roomId = roomId;
        this.socket = socket;
        this.editor = null;
        this.isApplyingRemoteChange = false;
        this.remoteCursorDecorations = {};
    }

    /**
     * Initialize Monaco editor instance
     */
    init(initialCode = '', language = 'javascript') {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }

        const MONACO_LANGUAGE_MAP = {
            c: 'c',
            cpp: 'cpp',
            java: 'java',
            python: 'python',
            javascript: 'javascript',
            php: 'php'
        };

        this.editor = monaco.editor.create(container, {
            value: initialCode,
            language: MONACO_LANGUAGE_MAP[language] || 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontWeight: '400',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            cursorSmoothCaretAnimation: "on",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            padding: { top: 10, bottom: 10 },
            mouseWheelZoom: true,
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
            }
        });

        // Listen to local code changes
        this.editor.onDidChangeModelContent(() => {
            if (this.isApplyingRemoteChange) return;
            if (!this.roomId) return;
            const code = this.editor.getValue();
            this.emitCodeChange(code);
        });

        // Listen to cursor changes
        this.editor.onDidChangeCursorSelection((e) => {
            if (!this.roomId) return;
            const selection = e.selection;
            this.emitCursorChange(selection.positionLineNumber, selection.positionColumn);
        });

        return this;
    }

    /**
     * Emit code change event to server
     */
    emitCodeChange(code) {
        const eventName = `code_change_${this.editorId}`;
        this.socket.emit(eventName, { roomId: this.roomId, code });
    }

    /**
     * Emit cursor change event to server
     */
    emitCursorChange(line, column) {
        const eventName = `cursor_change_${this.editorId}`;
        this.socket.emit(eventName, {
            roomId: this.roomId,
            cursor: { line, column }
        });
    }

    /**
     * Apply remote code changes
     */
    applyRemoteCode(code) {
        if (!this.editor) return;
        this.isApplyingRemoteChange = true;
        this.editor.setValue(code);
        this.isApplyingRemoteChange = false;
    }

    /**
     * Apply remote cursor position
     */
    applyRemoteCursor(userId, cursor) {
        if (!this.editor || !cursor) return;

        // Remove previous decorations for this user
        if (this.remoteCursorDecorations[userId]) {
            this.remoteCursorDecorations[userId] = this.editor.deltaDecorations(
                this.remoteCursorDecorations[userId],
                []
            );
        }

        const range = new monaco.Range(
            cursor.line,
            cursor.column,
            cursor.line,
            cursor.column
        );

        const decorations = [
            {
                range,
                options: {
                    className: 'remote-cursor',
                    stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
            }
        ];

        const newDecorations = this.editor.deltaDecorations([], decorations);
        this.remoteCursorDecorations[userId] = newDecorations;
    }

    /**
     * Set editor language
     */
    setLanguage(language) {
        if (!this.editor) return;
        const MONACO_LANGUAGE_MAP = {
            c: 'c',
            cpp: 'cpp',
            java: 'java',
            python: 'python',
            javascript: 'javascript',
            php: 'php',
        };
        const monacoLang = MONACO_LANGUAGE_MAP[language] || 'javascript';
        monaco.editor.setModelLanguage(this.editor.getModel(), monacoLang);
    }

    /**
     * Get current code
     */
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    /**
     * Update room ID
     */
    setRoomId(roomId) {
        this.roomId = roomId;
    }

    /**
     * Dispose editor instance
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}
