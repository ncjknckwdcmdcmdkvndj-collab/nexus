# Nexus: Discord Bot Admin Panel

## Core Identity

**A dedicated Discord bot account.**

- Has its own profile, avatar, status, and role
- Appears in servers as a staff member
- Controlled through Discord and a web interface
- Never pretends to be a human account

---

## Website Design / Feel

### Overall Style

**Theme:**
- Modern Discord + professional admin panel mix
- Dark mode by default
- Clean, minimal, "control center" feeling

**Think:**
- Discord layout
- Cloudflare dashboard organization
- Game admin panel aesthetics

### Main Layout

```
------------------------------------------------
| Logo | Server Selector | Search | Profile    |
------------------------------------------------
|       |                                  |
| Side  |                                  |
| Menu  |        Main Content              |
|       |                                  |
|       |                                  |
------------------------------------------------
```

### Left Sidebar

**Server Section**

Shows:
- Servers
  - 🟣 My SMP
  - 🔵 Gaming Hub
  - 🟢 Community
- + Add Server

Clicking a server opens that server's control panel.

---

## Server Dashboard

### Overview Page

**Shows:**

- **Bot Status**
  - 🟢 Bot Online
  
- **Key Metrics**
  - Members: 5,342
  - Messages Today: 42,901
  - Moderation Actions: 137
  - Support Tickets: 23

---

## Core Features

### 1. Discord Web Client

The main unique feature.

A Discord-like interface for viewing server activity:

```
SERVER

# general
# announcements
# reports
# staff-chat

               #general

User:
"Hey, what's the server rule about spam?"

Another User:
"Anyone know how to get started?"

---------------------

Message Box:
[Type message]
```

**The bot can:**
- Read channels it has access to
- Send messages
- Reply
- React
- Manage conversations
- View message history

---

### 2. Moderation Panel

**Automatic & Manual Moderation:**

Detection:
- Spam patterns
- Message flooding
- Excessive mentions
- Advertising links
- Raid attempts
- Suspicious behavior

**Staff Actions:**
- Warn users
- Timeout (mute)
- Delete message
- Report to staff
- Kick from server
- Ban from server
- Unban users

**Moderation Queue**

```
Moderation Queue

User123
Reason: Possible spam (flagged)
Confidence: 92%
Suggested Action:
[Warn] [Timeout] [Ignore]

---

Player456
Reason: Excessive mentions
Detected: 2 minutes ago
Suggested Action:
[Delete] [Warn] [Ignore]
```

---

### 3. Staff Tools

#### User Profiles

Click a member to view:

```
User123

Joined: March 12 2026
Warnings: 3
Messages: 12,442
Last Action: Warned for spam

Moderation History:
- Warned (3 days ago)
- Timeout 10m (5 days ago)

Quick Actions:
[Warn] [Timeout] [Kick] [Ban]
```

#### Staff Dashboard

Commands available through UI:
- Warn users
- Timeout
- Kick
- Ban
- Unban
- Purge messages
- Lock channels
- Unlock channels

---

### 4. Ticket System

Built-in support system.

**User creates ticket:**
```
/ticket

Creates: Ticket #19382

Category: Bug Report
Status: Open
Created: 2 hours ago
Priority: Normal

Message:
"The leveling system isn't working..."
```

**Staff can:**
- View all tickets
- Add responses
- Change status (Open, In Progress, Closed, Awaiting User)
- Assign to staff member
- Set priority level
- Close with resolution notes

---

### 5. Logging System

Full audit logs of all server activity.

**Tracks:**
- Messages (sent, deleted, edited)
- Moderation actions (warns, timeouts, bans, kicks)
- Commands executed
- Role changes
- Channel changes
- Permission updates
- Bot actions

**Log Entry Example:**
```
10:42 - Moderator Bot
Action: Deleted message
User: Player123
Reason: Spam
Channel: #general
Content: "[link to spam]"
```

**Filter by:**
- Date range
- User
- Action type
- Moderator
- Channel

---

### 6. Announcements

Create and send announcements to server.

**Announcement Creator**

```
Title: Server Update

Message:
New update released!
Check #announcements for details.

Send To:
☑ Discord channel
☑ Website dashboard

Channel: #announcements
Role Ping: @everyone / None

Schedule:
Send immediately / Schedule for later
```

---

### 7. Custom Commands

Create commands without coding.

**Command Builder**

```
Command: /rules
Response: Read our rules here: example.com/rules

Aliases: /r, /rule

Permissions: Everyone / Roles-specific

Cooldown: 5 seconds
```

Examples:
- `/rules` → Links to rules page
- `/help` → Lists available commands
- `/staff` → Shows staff contacts
- `/faq` → Frequently asked questions

---

### 8. Automation System

"If this happens, do this."

**Simple Automation Rules**

Examples:

**Rule: Welcome New Members**
```
WHEN: Someone joins
DO:
- Send welcome message
- Give starter role
- Add to introductions channel
```

**Rule: Auto-Moderation**
```
WHEN: User reaches 10 warnings
DO:
- Notify staff in #mod-log
- Create ticket for review
```

**Rule: Channel Management**
```
WHEN: Message reaches 5,000 count in channel
DO:
- Archive channel
- Notify staff
- Create new channel
```

---

### 9. Role & Permission System

**Website Access Levels:**

- **Owner** - Full control
- **Administrator** - Server management, moderation, settings
- **Moderator** - Moderation, tickets, logging
- **Helper** - Tickets, read-only moderation
- **Viewer** - View-only dashboard

Each level controls:
- What dashboard sections are visible
- What actions can be performed
- What logs can be accessed

---

### 10. Analytics & Statistics

**Dashboard Graphs**

**Server Activity:**
- Messages per day (last 30 days)
- New members (weekly)
- Active users (online now)
- Peak activity times

**Moderation Stats:**
- Warnings issued (last 7 days)
- Bans/Kicks (last 30 days)
- Common infraction reasons
- Most active moderators

**Ticket Stats:**
- Open tickets
- Average response time
- Closed tickets
- Resolution rate

**Channel Stats:**
- Most active channels
- Message count by channel
- User participation by channel

---

### 11. Bot Personality & Appearance

**Customize Bot Profile:**

```
Bot Name: Guardian

Profile Settings:
- Avatar
- Status: "Online" / "Do Not Disturb" / Custom
- Bio/About

Response Style:
- Professional
- Friendly
- Formal
- Casual

Response Length:
- Short
- Detailed
- Adaptive
```

---

### 12. Integrations

**Connect External Services:**

- Discord (primary)
- Minecraft servers
- Websites/webhooks
- APIs
- Game servers

**Example:**
```
Minecraft:
Player banned in Minecraft
↓
Discord punishment applied + logged
```

---

### 13. Security Features

**Critical for an admin account.**

Features:

- **Two-Factor Authentication (2FA)**
- **Login history** - Track all admin access
- **Action confirmation** - Require verification for sensitive actions
- **Permission groups** - Granular control
- **Emergency shutdown** - Disable bot remotely
- **Bot token protection** - Secure storage
- **Detailed audit logs** - Track who did what and when
- **IP whitelist** (optional)
- **Session management** - Log out old sessions

---

### 14. Mobile Support

**Responsive Dashboard**

Phone view adapts:
- Servers
- Dashboard
- Moderation queue
- Messages
- Tickets
- Settings

Touch-optimized controls for moderation actions.

---

## Overall Feel

When someone opens the dashboard, it should feel like:

> "I hired a professional staff member and this is my control room."

**Not:**
> "This is a bot settings page."

**The bot should feel like an actual member of the server team:**

- Has a staff role and permissions
- Has a history of actions
- Has responsibilities
- Has tools to manage the server
- Works with the team
- Handles problems professionally
