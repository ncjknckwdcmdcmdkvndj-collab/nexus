require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus_db'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize Discord bot
let discordClient = null;

const initializeBot = async () => {
  try {
    const bot = require('./bot');
    discordClient = bot;
    console.log('✅ Discord bot initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error);
  }
};

initializeBot();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Discord Bot Status
app.get('/api/bot/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bot_status LIMIT 1');
    res.json(result.rows[0] || { status: 'offline' });
  } catch (error) {
    console.error('Error fetching bot status:', error);
    res.status(500).json({ error: 'Failed to fetch bot status' });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const moderationRoutes = require('./routes/moderation');
const ticketRoutes = require('./routes/tickets');
const analyticsRoutes = require('./routes/analytics');
const emojiRoutes = require('./routes/emojis');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/emojis', emojiRoutes);

// Serve frontend static files
const frontendBuild = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuild));

// Catch-all for React router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

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
  console.log(`🚀 Nexus backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, pool, discordClient };
