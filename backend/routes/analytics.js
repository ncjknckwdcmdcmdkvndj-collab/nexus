const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Get analytics for server
router.get('/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const [activity, moderation, tickets] = await Promise.all([
      pool.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM messages 
         WHERE server_id = $1 AND created_at > NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [serverId]
      ),
      pool.query(
        `SELECT action, COUNT(*) as count 
         FROM moderation_logs 
         WHERE server_id = $1 AND created_at > NOW() - INTERVAL '30 days'
         GROUP BY action`,
        [serverId]
      ),
      pool.query(
        `SELECT status, COUNT(*) as count 
         FROM tickets 
         WHERE server_id = $1 AND created_at > NOW() - INTERVAL '30 days'
         GROUP BY status`,
        [serverId]
      )
    ]);

    res.json({
      activity: activity.rows,
      moderation: moderation.rows,
      tickets: tickets.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
