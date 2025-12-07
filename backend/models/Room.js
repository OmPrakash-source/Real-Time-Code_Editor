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
        default: 'javascript'
    },
    codeA: {
        type: String,
        default: 'console.log("Hello World")'
    },
    codeB: {
        type: String,
        default: 'console.log("Hello World")'
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
