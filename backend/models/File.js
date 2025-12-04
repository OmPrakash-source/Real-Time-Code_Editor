const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    code: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', FileSchema);
