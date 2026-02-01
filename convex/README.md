# EVOX Backend - Convex Functions

## Phase 1 Complete ✅

Backend infrastructure deployed by SAM.

## Structure

### Schema (`schema.ts`)
7 tables with proper indexes:
- **agents** - Agent management (name, role, status, currentTask, avatar, lastSeen)
- **tasks** - Task tracking (title, description, status, assignee, priority, timestamps)
- **messages** - Team communication (from, content, channel, mentions, threads)
- **activities** - Action logging (agent, action, target, metadata)
- **notifications** - Alert system (to, type, title, message, read, relatedTask)
- **documents** - Knowledge base (title, content, author, project)
- **heartbeats** - Health monitoring (agent, status, timestamp, metadata)

### CRUD Functions

#### `agents.ts`
- `create` - Create new agent
- `list` - Get all agents
- `get` - Get agent by ID
- `getByStatus` - Filter by online/offline/busy
- `updateStatus` - Update agent status
- `assignTask` - Assign task to agent
- `update` - Update agent details
- `heartbeat` - Record agent heartbeat
- `remove` - Delete agent

#### `tasks.ts`
- `create` - Create task (auto-logs activity, notifies assignee)
- `list` - Get all tasks
- `get` - Get task by ID
- `getByStatus` - Filter by backlog/todo/in_progress/review/done
- `getByAssignee` - Get tasks for specific agent
- `getByPriority` - Filter by low/medium/high/urgent
- `updateStatus` - Update status (auto-logs, notifies on review)
- `assign` - Assign task (logs + notifies)
- `update` - Update task details
- `remove` - Delete task

#### `messages.ts`
- `send` - Send message (auto-creates mention notifications)
- `list` - Get all messages
- `get` - Get message by ID
- `getByChannel` - Filter by general/dev/design
- `getThread` - Get thread messages
- `listWithAgents` - Messages with agent details populated
- `edit` - Edit message
- `remove` - Delete message

#### `activities.ts`
- `log` - Log activity
- `list` - Get all activities
- `get` - Get activity by ID
- `getByAgent` - Filter by agent
- `listWithAgents` - Activities with agent details
- `getByTimeRange` - Filter by time range
- `getByAction` - Filter by action type
- `cleanup` - Remove old activities
- `remove` - Delete activity

#### `notifications.ts`
- `create` - Create notification
- `getByAgent` - Get all notifications for agent
- `getUnread` - Get unread notifications
- `getUnreadCount` - Count unread
- `get` - Get notification by ID
- `markAsRead` - Mark single as read
- `markAllAsRead` - Mark all as read
- `remove` - Delete notification
- `clearRead` - Clear old read notifications

#### `documents.ts`
- `create` - Create document (logs activity)
- `list` - Get all documents
- `get` - Get document by ID
- `getByProject` - Filter by project
- `getByAuthor` - Filter by author
- `listWithAuthors` - Documents with author details
- `update` - Update document (logs activity)
- `remove` - Delete document

#### `seed.ts`
- `seedDatabase` - Populate with initial data (3 agents, 4 tasks, messages, activities, docs)
- `resetDatabase` - Clear all data (use with caution!)

## Initial Data

Seeds 3 agents:
- **SON** 👨‍💼 (PM) - Project manager
- **SAM** 🤖 (Backend) - Backend engineer
- **LEO** 🦁 (Frontend) - Frontend engineer

Seeds 4 tasks:
- EVOX-1: Setup Convex schema
- EVOX-2: Create backend CRUD functions
- EVOX-3: Design Mission Control UI
- EVOX-4: Implement real-time updates

## Next Steps

1. Initialize Convex: `npx convex dev`
2. Seed database: Call `seedDatabase` mutation
3. Frontend can now subscribe to real-time data
4. Use queries for reads, mutations for writes

## Territory Rules

SAM (Backend): convex/, scripts/, lib/evox/
LEO (Frontend): app/evox/, components/evox/

Commit format: closes EVOX-XX
