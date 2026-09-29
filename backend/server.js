require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const initCronJobs = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ---- Socket.io setup ----
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client sends its userId + areaCode right after connecting so it can
  // join the two rooms the rest of the app relies on for targeted events.
  socket.on('join', ({ userId, areaCode }) => {
    if (userId) socket.join(`user_${userId}`);
    if (areaCode) socket.join(`area_${areaCode}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ---- Middleware ----
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ---- Routes (listings/reservations need the io instance for real-time events) ----
app.use('/api/auth', authRoutes);
app.use('/api/listings', require('./routes/listings')(io));
app.use('/api/reservations', require('./routes/reservations')(io));
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Food Surplus Platform API is running' });
});

// ---- MongoDB connection + server start ----
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      initCronJobs(io);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
