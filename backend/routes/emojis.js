const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Get all bot emojis
router.get('/bot', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bot_emojis ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bot emojis:', error);
    res.status(500).json({ error: 'Failed to fetch bot emojis' });
  }
});

// Get server emojis
router.get('/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await pool.query(
      'SELECT * FROM server_emojis WHERE server_id = $1 ORDER BY name ASC',
      [serverId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching server emojis:', error);
    res.status(500).json({ error: 'Failed to fetch server emojis' });
  }
});

// Get combined emojis (bot + server)
router.get('/:serverId/combined', async (req, res) => {
  try {
    const { serverId } = req.params;
    const [botEmojis, serverEmojis] = await Promise.all([
      pool.query('SELECT * FROM bot_emojis ORDER BY name ASC'),
      pool.query('SELECT * FROM server_emojis WHERE server_id = $1 ORDER BY name ASC', [serverId])
    ]);

    res.json({
      bot: botEmojis.rows,
      server: serverEmojis.rows,
      combined: [...botEmojis.rows, ...serverEmojis.rows]
    });
  } catch (error) {
    console.error('Error fetching combined emojis:', error);
    res.status(500).json({ error: 'Failed to fetch emojis' });
  }
});

// Add emoji to favorites
router.post('/:serverId/favorite', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { emoji_id, emoji_name, emoji_url } = req.body;

    const result = await pool.query(
      'INSERT INTO favorite_emojis (server_id, emoji_id, emoji_name, emoji_url) VALUES ($1, $2, $3, $4) ON CONFLICT (server_id, emoji_id) DO NOTHING RETURNING *',
      [serverId, emoji_id, emoji_name, emoji_url]
    );

    res.json({ success: true, emoji: result.rows[0] });
  } catch (error) {
    console.error('Error adding favorite emoji:', error);
    res.status(500).json({ error: 'Failed to add favorite emoji' });
  }
});

// Remove emoji from favorites
router.delete('/:serverId/favorite/:emojiId', async (req, res) => {
  try {
    const { serverId, emojiId } = req.params;

    await pool.query(
      'DELETE FROM favorite_emojis WHERE server_id = $1 AND emoji_id = $2',
      [serverId, emojiId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite emoji:', error);
    res.status(500).json({ error: 'Failed to remove favorite emoji' });
  }
});

// Get favorite emojis
router.get('/:serverId/favorites', async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await pool.query(
      'SELECT * FROM favorite_emojis WHERE server_id = $1 ORDER BY created_at DESC',
      [serverId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite emojis:', error);
    res.status(500).json({ error: 'Failed to fetch favorite emojis' });
  }
});

module.exports = router;
