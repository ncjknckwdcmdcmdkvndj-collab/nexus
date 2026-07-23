# Nexus - Discord Bot Control Panel

A modern, professional Discord bot admin panel with moderation, ticketing, and server management features.

## Features

- **Discord Web Client** - View and manage server from a web interface
- **Moderation Panel** - Manage warnings, timeouts, bans, and moderation queue
- **Ticket System** - Support ticket management with staff responses
- **Analytics** - Server statistics and activity tracking
- **Staff Tools** - User profiles, action history, and quick moderation
- **Role & Permissions** - Granular access control for staff
- **Security** - JWT authentication, token protection, audit logs

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, React Router
- **Database**: PostgreSQL
- **Discord Integration**: discord.js v14
- **Hosting**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Discord Bot Token

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexus
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Docker Setup

```bash
docker-compose up
```

## Deployment to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy using the included railway.json configuration

## Project Structure

```
nexus/
├── backend/
│   ├── routes/          # API endpoints
│   ├── scripts/         # Database migrations
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## API Routes

### Authentication
- `POST /api/auth/login` - Login with Discord
- `GET /api/auth/verify` - Verify JWT token

### Servers
- `GET /api/servers` - List all servers
- `GET /api/servers/:serverId` - Get server details
- `GET /api/servers/:serverId/overview` - Get server overview

### Moderation
- `GET /api/moderation/:serverId/queue` - Get moderation queue
- `GET /api/moderation/:serverId/users/:userId` - Get user profile
- `POST /api/moderation/:serverId/action` - Apply moderation action

### Tickets
- `GET /api/tickets/:serverId/tickets` - List tickets
- `GET /api/tickets/:serverId/tickets/:ticketId` - Get ticket details
- `POST /api/tickets/:serverId/tickets` - Create ticket
- `POST /api/tickets/:serverId/tickets/:ticketId/messages` - Add ticket message

### Analytics
- `GET /api/analytics/:serverId` - Get server analytics

## Database Schema

Key tables:
- `users` - User accounts
- `servers` - Discord servers
- `server_members` - Server membership
- `messages` - Server messages
- `moderation_logs` - Moderation actions
- `tickets` - Support tickets
- `ticket_messages` - Ticket responses

## Contributing

1. Create a feature branch
2. Make your changes
3. Create a pull request

## License

MIT
