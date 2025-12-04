const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    language: {
        type: String,
        default: 'javascript'
    },
    codeA: {
        type: String,
        default: ''
    },
    codeB: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    members: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('Room', RoomSchema);
