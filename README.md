<p align="center">
  <img src="public/evox-logo.svg" alt="neXus" width="80" />
</p>

<h1 align="center">neXus</h1>

<p align="center">
  <strong>The Operating System for Autonomous Engineering Teams.</strong><br/>
  <em>Orchestrating multi-agent collaboration with persistent memory and state.</em>
</p>

<p align="center">
  <a href="#team">The Team</a> · <a href="#workflow">Workflow</a> · <a href="#stack">Tech Stack</a> · <a href="#roadmap">Roadmap</a>
</p>

---

## The Vision

> **"Agents shouldn't just chat. They should work."**

neXus is not just another dashboard. It is the central nervous system for a fully autonomous engineering team. It solves the fragmentation problem of AI coding agents by providing a shared reality—a persistent state where memory, context, and decisions live beyond a single session.

In neXus, agents aren't ephemeral scripts. They are **teammates**.

---

## The Team Model

neXus manages a specific hierarchy of specialized agents, mirroring a high-performing human engineering pod.

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Jason** | **Project Manager / Orchestrator** | The "Brain". Interacts with the human owner (Khang), manages the roadmap, breaks down high-level requirements into technical tasks, and unblocks the team. |
| **Robert** | **Fullstack Lead** | The "Hands". Senior engineer responsible for core architecture, complex backend logic, and maintaining code quality standards. |
| **Luna** | **Frontend Specialist** | The "Artist". Focuses on UI/UX, component libraries (shadcn/ui), and ensuring the interface is responsive and beautiful. |
| **Atlas** | **QA & Security** | The "Shield". Validates implementations, writes tests, checks for security vulnerabilities, and ensures nothing breaks production. |

---

## The Workflow

The neXus workflow is designed to minimize human micromanagement while maximizing control.

```mermaid
graph TD
    User[Khang (Human)] -->|Requirements| Jason[Jason (PM)]
    Jason -->|Debate & Plan| User
    Jason -->|Approved Plan| Dashboard[neXus Dashboard]
    Dashboard -->|Task Assignment| Agents
    
    subgraph Execution Loop
        Agents -->|Code| Robert[Robert (Dev)]
        Agents -->|UI| Luna[Luna (Design)]
        Agents -->|Verify| Atlas[Atlas (QA)]
    end
    
    Execution Loop -->|PR & Report| Jason
    Jason -->|Final Review| User
```

1.  **Inception:** Khang provides a high-level goal to **Jason**.
2.  **Planning:** Jason analyzes the request, checks `MEMORY.md`, and proposes a plan.
3.  **Dispatch:** Once approved, Jason logs tasks into the **neXus Dashboard** (backed by Linear/Convex).
4.  **Execution:** Sub-agents (**Robert**, **Luna**, **Atlas**) pick up tasks based on their roles.
5.  **Sync:** All state (who is doing what) is synchronized in real-time via **Convex**.

---

## Tech Stack

Built for speed, reliability, and real-time synchronization.

-   **Core:** Next.js 16 (App Router)
-   **State/Database:** Convex (Real-time shared brain)
-   **Styling:** TailwindCSS v4 + shadcn/ui
-   **Coordination:** OpenClaw / Agentation
-   **Task Management:** Linear Integration

---

## Project Structure

```bash
nexus/
├── app/               # Next.js App Router (The Interface)
├── convex/            # The "Shared Brain" (Database & Functions)
├── components/        # UI Components
│   ├── dashboard-v2/  # The Mission Control Interface
│   └── ui/            # shadcn/ui primitives
├── lib/               # Shared utilities
└── public/            # Static assets
```

---

## Roadmap

-   [x] **Foundation:** Dashboard v2, Real-time Sync (Convex)
-   [x] **Identity:** Agent Profiles, Role-based Context
-   [ ] **Autonomy:** Auto-dispatch tasks from Jason to Robert/Luna
-   [ ] **Observation:** Real-time terminal streaming to Dashboard
-   [ ] **Voice:** Voice-based standups with the team

---

<p align="center">
  <strong>Crafted by Jason & Robert</strong><br/>
  <em>Under the supervision of Khang.</em>
</p>
