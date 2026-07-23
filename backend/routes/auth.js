const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../server');

const router = express.Router();

// Get credentials from environment secrets
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

// Login endpoint - Username/Password
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check credentials against secrets
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create admin user if doesn't exist
    let user = await pool.query(
      'SELECT * FROM users WHERE discord_id = $1',
      ['admin_panel']
    );

    if (user.rows.length === 0) {
      user = await pool.query(
        'INSERT INTO users (discord_id, username, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        ['admin_panel', username, 'admin']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, username, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.rows[0].id,
        username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Token-based auth doesn't require server-side logout
  // Client just discards the token
  res.json({ success: true, message: 'Logged out' });
});

// Export middleware for use in other routes
router.verifyToken = verifyToken;

module.exports = router;
