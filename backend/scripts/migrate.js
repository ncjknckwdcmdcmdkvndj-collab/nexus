require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://nexus:nexus_dev_password@localhost:5432/nexus_db'
});

const migrations = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  avatar TEXT,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon TEXT,
  status VARCHAR(50) DEFAULT 'active',
  bot_personality VARCHAR(50) DEFAULT 'professional',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Server members
CREATE TABLE IF NOT EXISTS server_members (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  discord_id VARCHAR(255),
  username VARCHAR(255),
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  user_id VARCHAR(255),
  channel_id VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Moderation logs
CREATE TABLE IF NOT EXISTS moderation_logs (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  user_id VARCHAR(255),
  moderator_id VARCHAR(255),
  action VARCHAR(50),
  reason TEXT,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  user_id VARCHAR(255),
  reason TEXT,
  confidence FLOAT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  user_id VARCHAR(255),
  category VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  user_id VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bot status
CREATE TABLE IF NOT EXISTS bot_status (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),
  last_heartbeat TIMESTAMP DEFAULT NOW()
);

-- Bot emojis
CREATE TABLE IF NOT EXISTS bot_emojis (
  id SERIAL PRIMARY KEY,
  emoji_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT,
  animated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Server emojis
CREATE TABLE IF NOT EXISTS server_emojis (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  emoji_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT,
  animated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(server_id, emoji_id)
);

-- Favorite emojis
CREATE TABLE IF NOT EXISTS favorite_emojis (
  id SERIAL PRIMARY KEY,
  server_id INTEGER REFERENCES servers(id),
  emoji_id VARCHAR(255) NOT NULL,
  emoji_name VARCHAR(255),
  emoji_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(server_id, emoji_id)
);

-- Indexes
CREATE INDEX idx_servers_discord_id ON servers(discord_id);
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_messages_server_id ON messages(server_id);
CREATE INDEX idx_moderation_logs_server_id ON moderation_logs(server_id);
CREATE INDEX idx_tickets_server_id ON tickets(server_id);
CREATE INDEX idx_bot_emojis_name ON bot_emojis(name);
CREATE INDEX idx_server_emojis_server_id ON server_emojis(server_id);
CREATE INDEX idx_favorite_emojis_server_id ON favorite_emojis(server_id);
`;

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    const queries = migrations.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      await pool.query(query);
    }
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
