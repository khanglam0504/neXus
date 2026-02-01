# EVOX - Mission Control

A real-time dashboard for orchestrating AI agents that collaborate on software development tasks. Agents pick up tickets, write code, commit, and report back. You review and steer.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![Linear](https://img.shields.io/badge/Linear-Sync-blue)
![Status](https://img.shields.io/badge/Status-MVP%2083%25-green)

## What is this?

EVOX is a mission control interface for managing a team of AI coding agents. Instead of one AI chatbot doing everything, EVOX splits work across specialized agents that coordinate autonomously:

- **Max** (PM) - Creates tickets, tracks progress, writes retros
- **Sam** (Backend) - Convex functions, API logic, data layer
- **Leo** (Frontend) - React components, UI, styling

Linear is the source of truth. EVOX syncs every 2 minutes, tracks status changes, and surfaces everything in a live dashboard. The human (you) jumps in when agents need direction, architecture decisions, or feedback.

## Features

- **Dashboard** - Task counts, agent status, recent activity feed
- **Tasks Kanban** - Backlog / Todo / In Progress / Done columns, synced from Linear
- **Daily Standup** - Per-agent breakdown of completed, in progress, and blocked work
- **Activity Feed** - Timestamped log of every status change
- **Linear Sync** - Bi-directional sync on a 2-minute cron, with automatic activity creation on status changes
- **Agent Cards** - Real-time status, role, and current task for each agent

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React, shadcn/ui, Tailwind CSS |
| Backend | Convex (realtime database + serverless functions) |
| Project Management | Linear (via API sync) |
| Deploy | Vercel |
| Theme | Dark mode |

## Architecture

```
Linear API
    │
    ▼ (every 2 min)
┌─────────────────────────────┐
│  Convex Backend              │
│  ├── linearSync:syncAll      │
│  ├── tasks table (39)        │
│  ├── activities table (43)   │
│  ├── agents table (3)        │
│  └── projects table (4)      │
└─────────────┬───────────────┘
              │ useQuery (realtime)
              ▼
┌─────────────────────────────┐
│  Next.js 15 Frontend         │
│  ├── Dashboard               │
│  ├── Tasks Kanban            │
│  ├── Daily Standup           │
│  ├── Activity Feed           │
│  └── Agent Cards             │
└─────────────┬───────────────┘
              │
              ▼
         Vercel (prod)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account
- Linear account + API key

### Setup

```bash
# Clone
git clone https://github.com/sonpiaz/evox.git
cd evox

# Install
npm install

# Set up Convex
npx convex dev

# Environment variables
cp .env.example .env.local
# Add your NEXT_PUBLIC_CONVEX_URL and LINEAR_API_KEY
```

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` + Vercel | Convex deployment URL |
| `LINEAR_API_KEY` | Convex env | Linear API key for sync |

```bash
# Set Linear key in Convex
npx convex env set LINEAR_API_KEY your_key_here
```

### Run

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Status

**MVP: 83% complete** (30/39 issues done)

| Phase | Status |
|-------|--------|
| P1 Foundation (schema, CRUD, UI shell) | Done |
| P2 Communication (messages, notifications) | Done |
| P3 Heartbeat/CLI | Done |
| P4 Linear Sync | Done (4 polish bugs remaining) |
| P3 Execution Engine | Backlog |
| P5 Advanced (Slack, GitHub auto-commit) | Partial |

## How It Was Built

This project was built using AI agents orchestrated through Claude and Cursor:

- **Claude (claude.ai)** as Max the PM - managing Linear tickets, writing specs, diagnosing bugs from screenshots, updating project state
- **Claude Code / Cursor** as Sam and Leo - writing and committing code based on specs from Max
- **Human (Son)** as technical lead - reviewing output, providing feedback, making architecture decisions

The feedback loop: Linear ticket created, agent picks it up, codes the solution, commits, deploys. Human reviews screenshots, files bugs if needed, agents fix. Rinse and repeat.

## What's Next

- **Execution Engine** - Agents autonomously pick tasks, run code, commit to GitHub
- **Auto-PR** - Agents create pull requests, human approves
- **Slack Integration** - Notifications on task completion and blockers

## License

MIT

## Author

**Son Piaz** ([@sonpiaz](https://github.com/sonpiaz))

Built with AI agents, for AI agents.
