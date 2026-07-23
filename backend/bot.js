require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');
const { pool } = require('./server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ]
});

// Track bot status
let botReady = false;

// Bot ready event
client.on('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  botReady = true;

  // Update bot status in database
  try {
    await pool.query(
      'INSERT INTO bot_status (status, last_heartbeat) VALUES ($1, NOW()) ON CONFLICT (id) DO UPDATE SET status = $1, last_heartbeat = NOW()',
      ['online']
    );
  } catch (error) {
    console.error('Error updating bot status:', error);
  }

  // Set bot activity
  client.user.setActivity('servers', { type: 'WATCHING' });
});

// Guild join - register server
client.on('guildCreate', async (guild) => {
  console.log(`🟢 Joined guild: ${guild.name} (${guild.id})`);

  try {
    // Register server in database
    const result = await pool.query(
      'INSERT INTO servers (discord_id, name, icon, status) VALUES ($1, $2, $3, $4) ON CONFLICT (discord_id) DO UPDATE SET name = $2, icon = $3, status = $4 RETURNING *',
      [guild.id, guild.name, guild.iconURL(), 'active']
    );

    console.log(`📝 Server registered: ${result.rows[0].name}`);
  } catch (error) {
    console.error('Error registering guild:', error);
  }
});

// Guild leave - deactivate server
client.on('guildDelete', async (guild) => {
  console.log(`🔴 Left guild: ${guild.name} (${guild.id})`);

  try {
    await pool.query(
      'UPDATE servers SET status = $1 WHERE discord_id = $2',
      ['inactive', guild.id]
    );
  } catch (error) {
    console.error('Error updating guild status:', error);
  }
});

// Guild member join - track membership
client.on('guildMemberAdd', async (member) => {
  console.log(`👤 New member: ${member.user.tag} in ${member.guild.name}`);

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [member.guild.id]);
    
    if (guild.rows.length > 0) {
      await pool.query(
        'INSERT INTO server_members (server_id, discord_id, username, joined_at) VALUES ($1, $2, $3, NOW())',
        [guild.rows[0].id, member.user.id, member.user.username]
      );
    }
  } catch (error) {
    console.error('Error tracking member join:', error);
  }
});

// Message create - log messages
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Ignore DMs
  if (!message.guild) return;

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length > 0) {
      await pool.query(
        'INSERT INTO messages (server_id, user_id, channel_id, content, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [guild.rows[0].id, message.author.id, message.channel.id, message.content]
      );
    }
  } catch (error) {
    console.error('Error logging message:', error);
  }

  // Handle commands
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();

  handleCommand(message, command, args);
});

// Handle moderation commands
async function handleCommand(message, command, args) {
  const { guild, author, mentions } = message;

  try {
    switch (command) {
      case 'warn':
        handleWarn(message, args);
        break;
      case 'timeout':
        handleTimeout(message, args);
        break;
      case 'kick':
        handleKick(message, args);
        break;
      case 'ban':
        handleBan(message, args);
        break;
      case 'unban':
        handleUnban(message, args);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    message.reply('An error occurred while processing that command.');
  }
}

// Warn command: !warn @user [reason]
async function handleWarn(message, args) {
  const target = message.mentions.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!target) {
    return message.reply('Please mention a user to warn.');
  }

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length === 0) {
      return message.reply('Server not found in database.');
    }

    // Log the warning
    await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, moderator_id, action, reason, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [guild.rows[0].id, target.id, message.author.id, 'warn', reason]
    );

    // Send DM to user
    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#f59e0b')
            .setTitle('⚠️ You have been warned')
            .setDescription(`**Server:** ${message.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
            .setTimestamp()
        ]
      });
    } catch (err) {
      console.log('Could not send DM to user');
    }

    message.reply(`⚠️ Warned ${target.tag} for: ${reason}`);
  } catch (error) {
    console.error('Error applying warning:', error);
    message.reply('Failed to apply warning.');
  }
}

// Timeout command: !timeout @user [duration in minutes] [reason]
async function handleTimeout(message, args) {
  const target = message.mentions.first();
  const duration = parseInt(args[1]) || 10; // Default 10 minutes
  const reason = args.slice(2).join(' ') || 'No reason provided';

  if (!target) {
    return message.reply('Please mention a user to timeout.');
  }

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length === 0) {
      return message.reply('Server not found in database.');
    }

    // Get member object
    const member = await message.guild.members.fetch(target.id);

    // Apply timeout
    await member.timeout(duration * 60 * 1000, reason);

    // Log the timeout
    await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, moderator_id, action, reason, duration, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [guild.rows[0].id, target.id, message.author.id, 'timeout', reason, duration]
    );

    // Send DM to user
    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('⏱️ You have been timed out')
            .setDescription(`**Server:** ${message.guild.name}\n**Duration:** ${duration} minutes\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
            .setTimestamp()
        ]
      });
    } catch (err) {
      console.log('Could not send DM to user');
    }

    message.reply(`⏱️ Timed out ${target.tag} for ${duration} minutes. Reason: ${reason}`);
  } catch (error) {
    console.error('Error applying timeout:', error);
    message.reply('Failed to apply timeout.');
  }
}

// Kick command: !kick @user [reason]
async function handleKick(message, args) {
  const target = message.mentions.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!target) {
    return message.reply('Please mention a user to kick.');
  }

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length === 0) {
      return message.reply('Server not found in database.');
    }

    const member = await message.guild.members.fetch(target.id);

    // Send DM before kicking
    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('👢 You have been kicked')
            .setDescription(`**Server:** ${message.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
            .setTimestamp()
        ]
      });
    } catch (err) {
      console.log('Could not send DM to user');
    }

    // Kick the member
    await member.kick(reason);

    // Log the kick
    await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, moderator_id, action, reason, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [guild.rows[0].id, target.id, message.author.id, 'kick', reason]
    );

    message.reply(`👢 Kicked ${target.tag}. Reason: ${reason}`);
  } catch (error) {
    console.error('Error applying kick:', error);
    message.reply('Failed to kick user.');
  }
}

// Ban command: !ban @user [reason]
async function handleBan(message, args) {
  const target = message.mentions.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!target) {
    return message.reply('Please mention a user to ban.');
  }

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length === 0) {
      return message.reply('Server not found in database.');
    }

    // Send DM before banning
    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#dc2626')
            .setTitle('🚫 You have been banned')
            .setDescription(`**Server:** ${message.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
            .setTimestamp()
        ]
      });
    } catch (err) {
      console.log('Could not send DM to user');
    }

    // Ban the user
    await message.guild.bans.create(target.id, { reason });

    // Log the ban
    await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, moderator_id, action, reason, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [guild.rows[0].id, target.id, message.author.id, 'ban', reason]
    );

    message.reply(`🚫 Banned ${target.tag}. Reason: ${reason}`);
  } catch (error) {
    console.error('Error applying ban:', error);
    message.reply('Failed to ban user.');
  }
}

// Unban command: !unban <user-id> [reason]
async function handleUnban(message, args) {
  const userId = args[0];
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!userId) {
    return message.reply('Please provide a user ID to unban.');
  }

  try {
    const guild = await pool.query('SELECT id FROM servers WHERE discord_id = $1', [message.guild.id]);
    
    if (guild.rows.length === 0) {
      return message.reply('Server not found in database.');
    }

    // Unban the user
    await message.guild.bans.remove(userId, reason);

    // Log the unban
    await pool.query(
      'INSERT INTO moderation_logs (server_id, user_id, moderator_id, action, reason, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [guild.rows[0].id, userId, message.author.id, 'unban', reason]
    );

    message.reply(`✅ Unbanned user ${userId}. Reason: ${reason}`);
  } catch (error) {
    console.error('Error applying unban:', error);
    message.reply('Failed to unban user.');
  }
}

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

module.exports = client;
