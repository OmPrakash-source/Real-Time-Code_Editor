const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: { //actual room id that create for user
        type: String,
        required: true,
        unique: true,
        index: true
    },
    language: {
        type: String,
        default: 'C++'
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
