import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/servers', (req, res) => {
  res.json([
    { id: 1, name: 'My SMP', icon: '🟣', members: 5342, online: 1243 },
    { id: 2, name: 'Gaming Hub', icon: '🔵', members: 8932, online: 2341 },
    { id: 3, name: 'Community', icon: '🟢', members: 12453, online: 4532 }
  ]);
});

app.get('/api/servers/:id/overview', (req, res) => {
  res.json({
    serverId: req.params.id,
    botStatus: 'online',
    members: 5342,
    messagestoday: 42901,
    moderationActions: 137,
    supportTickets: 23
  });
});

app.get('/api/servers/:id/messages', (req, res) => {
  res.json({
    channel: 'general',
    messages: [
      { user: 'User123', content: "Hey, what's the server rule about spam?", timestamp: '10:42' },
      { user: 'AnotherUser', content: 'Anyone know how to get started?', timestamp: '10:43' }
    ]
  });
});

app.get('/api/moderation/queue', (req, res) => {
  res.json([
    { id: 1, user: 'User123', reason: 'Possible spam', confidence: 92, action: 'pending' },
    { id: 2, user: 'Player456', reason: 'Excessive mentions', confidence: 85, action: 'pending' }
  ]);
});

app.get('/api/tickets', (req, res) => {
  res.json([
    { id: 19382, category: 'Bug Report', status: 'Open', created: '2 hours ago', priority: 'Normal', message: "The leveling system isn't working..." }
  ]);
});

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Nexus running on port ${PORT}`);
});

