require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (optional - graceful fallback if no DB)
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Discord Bot Status
app.get('/api/bot/status', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ status: 'online' });
    }
    const result = await pool.query('SELECT * FROM bot_status LIMIT 1');
    res.json(result.rows[0] || { status: 'offline' });
  } catch (error) {
    console.error('Error fetching bot status:', error);
    res.status(500).json({ error: 'Failed to fetch bot status' });
  }
});

// Import routes if they exist
try {
  const authRoutes = require('./routes/auth');
  const serverRoutes = require('./routes/servers');
  const moderationRoutes = require('./routes/moderation');
  const ticketRoutes = require('./routes/tickets');
  const analyticsRoutes = require('./routes/analytics');

  // Use routes
  app.use('/api/auth', authRoutes);
  app.use('/api/servers', serverRoutes);
  app.use('/api/moderation', moderationRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/analytics', analyticsRoutes);
} catch (e) {
  console.log('Routes not fully configured yet, running in basic API mode');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nexus Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, pool };

