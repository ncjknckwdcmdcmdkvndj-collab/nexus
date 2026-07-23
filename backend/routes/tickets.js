const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Get all tickets for server
router.get('/:serverId/tickets', async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await pool.query(
      'SELECT * FROM tickets WHERE server_id = $1 ORDER BY created_at DESC',
      [serverId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:serverId/tickets/:ticketId', async (req, res) => {
  try {
    const { serverId, ticketId } = req.params;
    const [ticket, messages] = await Promise.all([
      pool.query('SELECT * FROM tickets WHERE id = $1 AND server_id = $2', [ticketId, serverId]),
      pool.query('SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at', [ticketId])
    ]);

    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      ticket: ticket.rows[0],
      messages: messages.rows
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create ticket
router.post('/:serverId/tickets', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { userId, category, title, description } = req.body;

    const result = await pool.query(
      'INSERT INTO tickets (server_id, user_id, category, title, description, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [serverId, userId, category, title, description, 'open']
    );

    res.json({ success: true, ticket: result.rows[0] });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Add ticket message
router.post('/:serverId/tickets/:ticketId/messages', async (req, res) => {
  try {
    const { serverId, ticketId } = req.params;
    const { userId, message } = req.body;

    const result = await pool.query(
      'INSERT INTO ticket_messages (ticket_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [ticketId, userId, message]
    );

    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

module.exports = router;
