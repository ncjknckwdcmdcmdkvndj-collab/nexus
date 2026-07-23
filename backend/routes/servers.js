const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Get all servers for user
router.get('/', async (req, res) => {
  try {
    // TODO: Get user from JWT token
    const result = await pool.query(
      'SELECT * FROM servers WHERE status = $1 ORDER BY name',
      ['active']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// Get server details
router.get('/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await pool.query(
      'SELECT * FROM servers WHERE id = $1',
      [serverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching server:', error);
    res.status(500).json({ error: 'Failed to fetch server' });
  }
});

// Get server overview (dashboard)
router.get('/:serverId/overview', async (req, res) => {
  try {
    const { serverId } = req.params;
    const [server, members, messages, modActions] = await Promise.all([
      pool.query('SELECT * FROM servers WHERE id = $1', [serverId]),
      pool.query('SELECT COUNT(*) as count FROM server_members WHERE server_id = $1', [serverId]),
      pool.query('SELECT COUNT(*) as count FROM messages WHERE server_id = $1 AND created_at > NOW() - INTERVAL \'1 day\'', [serverId]),
      pool.query('SELECT COUNT(*) as count FROM moderation_logs WHERE server_id = $1 AND created_at > NOW() - INTERVAL \'1 day\'', [serverId])
    ]);

    res.json({
      server: server.rows[0],
      members: parseInt(members.rows[0].count),
      messagestoday: parseInt(messages.rows[0].count),
      moderationActions: parseInt(modActions.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

module.exports = router;
