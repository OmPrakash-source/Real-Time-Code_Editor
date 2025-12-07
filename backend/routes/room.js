// assign new room id to user if it exist then show error
const express = require('express');
const Room = require('../models/Room');
const File = require('../models/File');
const generateRoomId = require('../utils/idGenerator');

const router = express.Router();

/*
  POST /room/create
  Creates a new room and associated file entry.
  Optional: client can pass custom roomId in body.
 */
router.post('/create', async (req, res) => {
    try {
        const { roomId: requestedRoomId, language } = req.body || {};

        let roomId = requestedRoomId || generateRoomId(8);

        // Ensure uniqueness if client provided an existing one
        if (requestedRoomId) {
            const existing = await Room.findOne({ roomId });
            if (existing) {
                return res
                    .status(400)
                    .json({ error: 'Room ID already exists. Choose another.' });
            }
        } else {
            // Generate until unique
            // (very unlikely loop, but safe)
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const existing = await Room.findOne({ roomId });
                if (!existing) break;
                roomId = generateRoomId(8);
            }
        }

        const room = await Room.create({
            roomId,
            language: language || 'javascript'
        });

        await File.create({
            roomId,
            code: '',
            lastUpdated: new Date()
        });

        return res.status(201).json({
            roomId: room.roomId,
            language: room.language
        });
    } catch (err) {
        console.error('Create room error:', err.message);
        return res.status(500).json({ error: 'Failed to create room' });
    }
});

/**
 * GET /room/:roomId
 * Returns room metadata and initial code.
 */
router.get('/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        let file = await File.findOne({ roomId });
        if (!file) {
            file = await File.create({
                roomId,
                code: '',
                lastUpdated: new Date()
            });
        }

        return res.json({
            room: {
                roomId: room.roomId,
                language: room.language,
                members: room.members,
                createdAt: room.createdAt
            },
            file: {
                code: file.code,
                lastUpdated: file.lastUpdated
            }
        });
    } catch (err) {
        console.error('Get room error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch room' });
    }
});

module.exports = router;
