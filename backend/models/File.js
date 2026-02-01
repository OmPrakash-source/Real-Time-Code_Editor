const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true, //Room ID it can't be null and empty
        index: true //Index for faster lookup
    },
    code: {
        type: String, //ex- code: "console.log('Hello World');"
        default: '', //Default code is empty string
    },
    lastUpdated: {
        type: Date,
        default: Date.now //Default lastUpdated is current time
    }
});

module.exports = mongoose.model('File', FileSchema);
