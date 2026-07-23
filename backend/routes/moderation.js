const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Get moderation queue for server
router.get('/:serverId/queue', async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await pool.query(
      'SELECT * FROM moderation_queue WHERE server_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 50',
      [serverId, 'pending']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Get user profile
router.get('/:serverId/users/:userId', async (req, res) => {
  try {
    const { serverId, userId } = req.params;
    const [user, warnings, history] = await Promise.all([
      pool.query('SELECT * FROM users WHERE discord_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count FROM moderation_logs WHERE server_id = $1 AND user_id = $2 AND action = $3', [serverId, userId, 'warn']),
      pool.query('SELECT * FROM moderation_logs WHERE server_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 10', [serverId, userId])
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user.rows[0],
      warnings: parseInt(warnings.rows[0].count),
      history: history.rows
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Apply moderation action
router.post('/:serverId/action', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { userId, action, reason, duration } = req.body;

    // TODO: Verify permissions

    const result = await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, action, reason, duration, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [serverId, userId, action, reason, duration]
    );

    // TODO: Execute action on Discord

    res.json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Error applying action:', error);
    res.status(500).json({ error: 'Failed to apply action' });
  }
});

module.exports = router;
