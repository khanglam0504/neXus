import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Check if already seeded - must have BOTH agents AND projects
    const existingAgents = await ctx.db.query("agents").collect();
    const existingProjects = await ctx.db.query("projects").collect();

    if (existingAgents.length > 0 && existingProjects.length > 0) {
      return { message: "Database already seeded", skipped: true };
    }

    // Handle partial state
    const shouldCreateAgents = existingAgents.length === 0;
    const shouldCreateProjects = existingProjects.length === 0;

    const now = Date.now();

    // Get or create projects
    let evoxProjectId: Id<"projects">;
    let agentFactoryId: Id<"projects">;
    let affitorId: Id<"projects">;
    let myTimezoneId: Id<"projects">;

    if (shouldCreateProjects) {
      evoxProjectId = await ctx.db.insert("projects", {
        name: "EVOX",
        description: "Mission Control MVP - Agent coordination dashboard",
        createdAt: now,
      });

      agentFactoryId = await ctx.db.insert("projects", {
        name: "Agent Factory",
        description: "AI agent creation and management platform",
        createdAt: now,
      });

      affitorId = await ctx.db.insert("projects", {
        name: "Affitor",
        description: "Affiliate marketing automation tool",
        createdAt: now,
      });

      myTimezoneId = await ctx.db.insert("projects", {
        name: "MyTimezone",
        description: "Global time zone coordination app",
        createdAt: now,
      });
    } else {
      const evox = existingProjects.find((p) => p.name === "EVOX");
      if (!evox) {
        evoxProjectId = await ctx.db.insert("projects", {
          name: "EVOX",
          description: "Mission Control MVP - Agent coordination dashboard",
          createdAt: now,
        });
      } else {
        evoxProjectId = evox._id;
      }
      agentFactoryId = existingProjects.find((p) => p.name === "Agent Factory")?._id ?? evoxProjectId;
      affitorId = existingProjects.find((p) => p.name === "Affitor")?._id ?? evoxProjectId;
      myTimezoneId = existingProjects.find((p) => p.name === "MyTimezone")?._id ?? evoxProjectId;
    }

    // Get or create agents
    let sonId: Id<"agents">;
    let samId: Id<"agents">;
    let leoId: Id<"agents">;

    if (shouldCreateAgents) {
      sonId = await ctx.db.insert("agents", {
        name: "SON",
        role: "pm",
        status: "online",
        avatar: "👨‍💼",
        lastSeen: now,
      });

      samId = await ctx.db.insert("agents", {
        name: "SAM",
        role: "backend",
        status: "online",
        avatar: "🤖",
        lastSeen: now,
      });

      leoId = await ctx.db.insert("agents", {
        name: "LEO",
        role: "frontend",
        status: "offline",
        avatar: "🦁",
        lastSeen: now,
      });
    } else {
      const son = existingAgents.find((a) => a.name === "SON" || a.role === "pm");
      const sam = existingAgents.find((a) => a.name === "SAM" || a.role === "backend");
      const leo = existingAgents.find((a) => a.name === "LEO" || a.role === "frontend");

      sonId = son?._id ?? existingAgents[0]._id;
      samId = sam?._id ?? existingAgents[0]._id;
      leoId = leo?._id ?? existingAgents[0]._id;
    }

    // Only create sample tasks/messages if this is a full fresh seed
    if (shouldCreateAgents && shouldCreateProjects) {
      // Create initial tasks
      const task1 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-1: Setup Convex schema",
        description: "Create schema.ts with 7 tables: agents, tasks, messages, activities, notifications, documents, heartbeats",
        status: "in_progress",
        priority: "urgent",
        assignee: samId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      const task2 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-2: Create backend CRUD functions",
        description: "Implement CRUD operations for agents, tasks, messages, activities in Convex",
        status: "in_progress",
        priority: "high",
        assignee: samId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      const task3 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-3: Design Mission Control UI",
        description: "Create main dashboard layout with agent status, task board, and activity feed",
        status: "todo",
        priority: "high",
        assignee: leoId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-4: Implement real-time updates",
        description: "Connect frontend to Convex subscriptions for live data updates",
        status: "backlog",
        priority: "medium",
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      // Create welcome messages
      await ctx.db.insert("messages", {
        from: sonId,
        content: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        channel: "general",
        mentions: [samId, leoId],
        createdAt: now,
      });

      await ctx.db.insert("messages", {
        from: samId,
        content: "Backend infrastructure ready. Schema and CRUD functions deployed. ⚙️",
        channel: "dev",
        mentions: [],
        createdAt: now + 1000,
      });

      // Create initial activities
      await ctx.db.insert("activities", {
        agent: samId,
        action: "created_schema",
        target: "convex/schema.ts",
        metadata: { tables: 7 },
        createdAt: now,
      });

      await ctx.db.insert("activities", {
        agent: samId,
        action: "deployed_functions",
        target: "convex/",
        metadata: { files: ["agents.ts", "tasks.ts", "messages.ts", "activities.ts"] },
        createdAt: now + 1000,
      });

      await ctx.db.insert("activities", {
        agent: sonId,
        action: "created_task",
        target: task1,
        createdAt: now + 2000,
      });

      // Create initial notifications
      await ctx.db.insert("notifications", {
        to: samId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-1: Setup Convex schema",
        read: false,
        relatedTask: task1,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: samId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-2: Create backend CRUD functions",
        read: false,
        relatedTask: task2,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: leoId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-3: Design Mission Control UI",
        read: false,
        relatedTask: task3,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: samId,
        type: "mention",
        title: "You were mentioned",
        message: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        read: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: leoId,
        type: "mention",
        title: "You were mentioned",
        message: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        read: false,
        createdAt: now,
      });

      // Create initial documentation
      await ctx.db.insert("documents", {
        title: "EVOX Architecture",
        content: `# EVOX Architecture

## Tech Stack
- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Database: Convex (real-time, serverless)

## Agent Territories
- SON (PM): Project management, requirements, coordination
- SAM (Backend): convex/, scripts/, lib/evox/
- LEO (Frontend): app/evox/, components/evox/

## Rules
- Commit format: closes EVOX-XX
- No auto-push unless Son approves
- Types first: schema.ts before UI`,
        author: sonId,
        project: "EVOX",
        updatedAt: now,
      });

      // Create initial heartbeats
      await ctx.db.insert("heartbeats", {
        agent: sonId,
        status: "online",
        timestamp: now,
        metadata: { source: "seed" },
      });

      await ctx.db.insert("heartbeats", {
        agent: samId,
        status: "online",
        timestamp: now,
        metadata: { source: "seed" },
      });

      await ctx.db.insert("heartbeats", {
        agent: leoId,
        status: "offline",
        timestamp: now,
        metadata: { source: "seed" },
      });
    }

    return {
      message: shouldCreateAgents && shouldCreateProjects
        ? "Database seeded successfully"
        : "Database repaired - missing entities created",
      projects: { evoxProjectId, agentFactoryId, affitorId, myTimezoneId },
      agents: { sonId, samId, leoId },
      createdAgents: shouldCreateAgents,
      createdProjects: shouldCreateProjects,
    };
  },
});

// Reset database (use with caution!)
export const resetDatabase = mutation({
  handler: async (ctx) => {
    // Delete all data from all tables
    const tables = [
      "projects",
      "agents",
      "tasks",
      "messages",
      "activities",
      "notifications",
      "documents",
      "heartbeats",
      "settings",
    ] as const;

    let totalDeleted = 0;

    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
        totalDeleted++;
      }
    }

    return {
      message: "Database reset complete",
      deletedCount: totalDeleted,
    };
  },
});
