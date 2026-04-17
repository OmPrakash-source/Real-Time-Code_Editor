const Room = require('./models/Room');
const File = require('./models/File');
const UserSession = require('./models/UserSession');

const SAVE_DEBOUNCE_MS = 3000;

// roomId -> timeout
const saveTimers = new Map();
// roomId -> latest code
const latestCode = new Map();
// Separate timers for dual editors
const saveTimersA = new Map();
const saveTimersB = new Map();
const latestCodeA = new Map();
const latestCodeB = new Map();
// socketId -> { roomId, userId }
const socketRoomMap = new Map(); //socketRoomMap is a part of redis use for State Caching

/**
 * Initialize Socket.IO events
 */
module.exports = function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('New socket connected:- ', socket.id);

        socket.on('join_room', async ({ roomId, userId, language }) => {
            try {
                if (!roomId || !userId) return;

                socket.join(roomId);
                socketRoomMap.set(socket.id, { roomId, userId });

                // Upsert room
                const room = await Room.findOneAndUpdate(
                    { roomId },
                    {
                        $setOnInsert: {
                            roomId,
                            language: language || 'javascript',
                            createdAt: new Date()
                        },
                        $addToSet: { members: userId }
                    },{
                        new: true, upsert: true
                      }
                );

                // Ensure file exists
                let file = await File.findOne({ roomId });
                if (!file) {
                    file = await File.create({
                        roomId,
                        code: '',
                        lastUpdated: new Date()
                    });
                }

                // Track user session
                await UserSession.create({
                    userId,
                    roomId,
                    joinedAt: new Date()
                });

                // Send initial state to this client
                socket.emit('init_state', {
                    room: {
                        roomId: room.roomId,
                        language: room.language,
                        members: room.members
                    },
                    file: {
                        code: file.code,
                        lastUpdated: file.lastUpdated
                    }
                });

                // Send dual editor initial states
                socket.emit('load_codeA', room.codeA || '');
                socket.emit('load_codeB', room.codeB || '');

                // Notify others
                socket.to(roomId).emit('user_joined', { userId });

                console.log(` ${userId} joined room ${roomId}`);
            } catch (err) {
                console.error('join_room error:', err.message);
                socket.emit('error_message', { message: 'Failed to join room' });
            }
        });

        socket.on('code_change', async ({ roomId, code }) => {
            try {
                if (!roomId || typeof code !== 'string') return;

                // Broadcast to others
                socket.to(roomId).emit('code_change', { code });

                // Debounced save
                latestCode.set(roomId, code);
                //latest code is a part of redis use for State Caching
                //if timer is already running is a part of redis use for State Caching
                if (saveTimers.has(roomId)) {
                    clearTimeout(saveTimers.get(roomId));
                }

                const timeoutId = setTimeout(async () => {
                    try {
                        const codeToSave = latestCode.get(roomId);
                        if (typeof codeToSave === 'string') {
                            await File.findOneAndUpdate(
                                { roomId },
                                {
                                    code: codeToSave,
                                    lastUpdated: new Date()
                                },
                                { upsert: true }
                            );
                            // console.log(`💾 Auto-saved room ${roomId}`);
                        }
                    } catch (err) {
                        console.error('Auto-save error:', err.message);
                    }
                }, SAVE_DEBOUNCE_MS);

                saveTimers.set(roomId, timeoutId);
            } catch (err) {
                console.error('code_change error:', err.message);
            }
        });

        socket.on('cursor_change', ({ roomId, userId, range }) => {
            if (!roomId || !userId || !range) return;
            socket.to(roomId).emit('cursor_change', { userId, range });
        });

        socket.on('language_change', async ({ roomId, language }) => {
            try {
                if (!roomId || !language) return;

                await Room.findOneAndUpdate(
                    { roomId },
                    { language },
                    { new: true }
                );

                socket.to(roomId).emit('language_change', { language });
            } catch (err) {
                console.error('language_change error:', err.message);
            }
        });

        socket.on('leave_room', async ({ roomId, userId }) => {
            try {
                if (!roomId || !userId) return;

                socket.leave(roomId);
                await Room.updateOne(
                    { roomId },
                    { $pull: { members: userId } }
                );
                await UserSession.deleteMany({ roomId, userId });

                socket.to(roomId).emit('user_left', { userId });

                console.log(` ${userId} left room ${roomId}`);
            } catch (err) {
                console.error('leave_room error:', err.message);
            }
        });

        socket.on('disconnect', async () => {
            try {
                const mapping = socketRoomMap.get(socket.id);
                if (!mapping) return;

                const { roomId, userId } = mapping;

                await Room.updateOne(
                    { roomId },
                    { $pull: { members: userId } }
                );
                await UserSession.deleteMany({ roomId, userId });

                socket.to(roomId).emit('user_left', { userId });

                socketRoomMap.delete(socket.id);
                console.log(` Socket ${socket.id} disconnected from room ${roomId}`);
            } catch (err) {
                console.error('disconnect error:', err.message);
            }
        });

        // ---- Dual Editor Events ----

        // Screen A - Code change
        socket.on('code_change_A', async ({ roomId, code }) => {
            try {
                if (!roomId || typeof code !== 'string') return;

                // Broadcast to others
                socket.to(roomId).emit('code_update_A', code);

                // Debounced save
                latestCodeA.set(roomId, code);

                if (saveTimersA.has(roomId)) {
                    clearTimeout(saveTimersA.get(roomId));
                }

                const timeoutId = setTimeout(async () => {
                    try {
                        const codeToSave = latestCodeA.get(roomId);
                        if (typeof codeToSave === 'string') {
                            await Room.findOneAndUpdate(
                                { roomId },
                                { codeA: codeToSave },
                                { upsert: true }
                            );
                        }
                    } catch (err) {
                        console.error('Auto-save codeA error:', err.message);
                    }
                }, SAVE_DEBOUNCE_MS);

                saveTimersA.set(roomId, timeoutId);
            } catch (err) {
                console.error('code_change_A error:', err.message);
            }
        });

        // Screen A - Cursor change
        socket.on('cursor_change_A', ({ roomId, cursor }) => {
            if (!roomId || cursor === undefined) return;
            socket.to(roomId).emit('cursor_update_A', cursor);
        });

        // Screen B - Code change
        socket.on('code_change_B', async ({ roomId, code }) => {
            try {
                if (!roomId || typeof code !== 'string') return;

                // Broadcast to others
                socket.to(roomId).emit('code_update_B', code);

                // Debounced save
                latestCodeB.set(roomId, code);

                if (saveTimersB.has(roomId)) {
                    clearTimeout(saveTimersB.get(roomId));
                }

                const timeoutId = setTimeout(async () => {
                    try {
                        const codeToSave = latestCodeB.get(roomId);
                        if (typeof codeToSave === 'string') {
                            await Room.findOneAndUpdate(
                                { roomId },
                                { codeB: codeToSave },
                                { upsert: true }
                            );
                        }
                    } catch (err) {
                        console.error('Auto-save codeB error:', err.message);
                    }
                }, SAVE_DEBOUNCE_MS);

                saveTimersB.set(roomId, timeoutId);
            } catch (err) {
                console.error('code_change_B error:', err.message);
            }
        });

        // Screen B - Cursor change
        socket.on('cursor_change_B', ({ roomId, cursor }) => {
            if (!roomId || cursor === undefined) return;
            socket.to(roomId).emit('cursor_update_B', cursor);
        });

        // Chat Message
        socket.on('chat_message', ({ roomId, userId, text }) => {
            if (!roomId || !userId || !text) return;
            socket.to(roomId).emit('chat_message', { userId, text });
        });
    });
};
