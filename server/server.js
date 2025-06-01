const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config');
const { sequelize, connectDB } = require('./config/db');

// Import models
const Integration = require('./models/Integration');
const Metric = require('./models/Metric');

// Import routes
const integrationRoutes = require('./routes/integrations');
const metricsRoutes = require('./routes/metrics');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MariaDB
connectDB()
  .then(() => {
    // Sync models with database
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/metrics', metricsRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a room based on integration ID
  socket.on('joinIntegration', (integrationId) => {
    socket.join(integrationId);
  });

  // Leave a room
  socket.on('leaveIntegration', (integrationId) => {
    socket.leave(integrationId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Export io to be used in other files
app.set('io', io);

const PORT = config.port || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
