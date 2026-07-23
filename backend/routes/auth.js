const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../server');

const router = express.Router();

// Login endpoint - Discord OAuth
router.post('/login', async (req, res) => {
  try {
    const { discordId, username, avatar, email } = req.body;

    // TODO: Verify Discord token

    // Check if user exists
    let user = await pool.query(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordId]
    );

    if (user.rows.length === 0) {
      // Create new user
      user = await pool.query(
        'INSERT INTO users (discord_id, username, avatar, email, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [discordId, username, avatar, email]
      );
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, discordId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: user.rows[0]
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
