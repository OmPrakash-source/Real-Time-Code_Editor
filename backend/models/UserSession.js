// UserSession.js
const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
    userId: { //how is in room 
        type: String,
        required: true, //User ID it can't be null and empty
        index: true //Index for faster lookup
    },
    roomId: { //in which room user is in
        type: String,
        required: true, //Room ID it can't be null and empty
        index: true //Index for faster lookup
    },
    joinedAt: { //when user joined room there time 
        type: Date,
        default: Date.now //Default joined is current time
    }
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
