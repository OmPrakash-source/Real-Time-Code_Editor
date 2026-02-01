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
        default: 'C++'
    },
    codeA: {
        type: String,
        default: '#include <iostream>\nusing namespace std;\nint main() {\ncout << "Hello World";\nreturn 0;\n}'
    },
    codeB: {
        type: String,
        default: '#include <iostream>\nusing namespace std;\nint main() {\ncout << "Hello World";\nreturn 0;\n}'
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
