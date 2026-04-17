const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Room = require('./models/Room');
const File = require('./models/File');
const UserSession = require('./models/UserSession');

const roomRoutes = require('./routes/room');
const compileRoutes = require('./routes/compile');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- API Routes ----
app.use('/room', roomRoutes);
app.use('/compile', compileRoutes);

// Catch-all for SPA (serves index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ---- Socket.IO ----
initSocket(io);

// ---- MongoDB Connection ----
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ---- Cleanup Cron Job ----
// Runs every 15 minutes
const FILE_EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || '6', 10);

cron.schedule('*/15 * * * *', async () => {
  try {
    console.log(' Running cleanup job...');

    const expiryDate = new Date(Date.now() - FILE_EXPIRY_HOURS * 60 * 60 * 1000); //after every 6hr cleanup file automatic

    // Delete old files
    const oldFiles = await File.find({ lastUpdated: { $lt: expiryDate } });
    const oldRoomIds = oldFiles.map((f) => f.roomId);

    if (oldFiles.length > 0) {
      await File.deleteMany({ roomId: { $in: oldRoomIds } });
      console.log(`Deleted ${oldFiles.length} old files`);
    }

    // Delete rooms with no members
    const emptyRooms = await Room.find({ members: { $size: 0 } });
    const emptyRoomIds = emptyRooms.map((r) => r.roomId);

    if (emptyRooms.length > 0) {
      await Room.deleteMany({ roomId: { $in: emptyRoomIds } }); //without done totally this work run next line to save time this task take time to complete
      await UserSession.deleteMany({ roomId: { $in: emptyRoomIds } });
      console.log(`Deleted ${emptyRooms.length} empty rooms`);
    }

    console.log(' Cleanup complete');
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
});

//Start server 
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
