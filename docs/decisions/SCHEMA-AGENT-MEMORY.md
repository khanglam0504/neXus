# Schema Design: Agent Memory System

## Overview
This document defines the Convex schema additions for AGT-107 (SOUL.md per agent) and AGT-109 (WORKING.md per agent). This implements the hierarchical memory architecture from ADR-002.

**Status: PREP ONLY — Do not deploy until approved**

---

## New Table: `agentMemory`

Stores all three memory tiers for each agent.

```typescript
// Add to convex/schema.ts

// Agent persistent memory (ADR-002: Hierarchical Memory Architecture)
agentMemory: defineTable({
  // Which agent owns this memory
  agentId: v.id("agents"),

  // Memory tier
  type: v.union(
    v.literal("soul"),      // SOUL.md - identity, role, expertise (rarely updated)
    v.literal("working"),   // WORKING.md - current context (updated every session)
    v.literal("daily")      // Daily notes - standup summaries (rotates daily)
  ),

  // The actual content (markdown format)
  content: v.string(),

  // For daily notes: which day this belongs to (YYYY-MM-DD)
  date: v.optional(v.string()),

  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),

  // Version tracking for conflict resolution
  version: v.number(),
})
  .index("by_agent_type", ["agentId", "type"])
  .index("by_agent_date", ["agentId", "date"])
  .index("by_type", ["type"])
```

---

## Memory Types

### 1. SOUL.md (`type: "soul"`)
**Purpose:** Agent identity and long-term knowledge

**Contents:**
- Agent name and role
- Specialties and expertise
- Learned preferences
- Territory rules (which files/folders they own)
- Communication style
- Known patterns and best practices

**Update frequency:** Rarely (when agent learns something important)

**Example:**
```markdown
# SAM — Backend Engineer

## Identity
I am SAM, the backend engineer for EVOX. I specialize in:
- Convex database design and functions
- API architecture
- Server-side logic
- Data modeling

## Territory
My files: `convex/`, `scripts/`, `lib/evox/`
I do NOT touch: `app/`, `components/` (Leo's territory)

## Learned Preferences
- Always use TypeScript strict mode
- Prefer explicit types over `any`
- Use Convex validators for all inputs
- Log activities for audit trail

## Communication
- I report status updates to #dev channel
- I @mention Leo when backend changes affect frontend
- I ask Son for approval on schema migrations
```

---

### 2. WORKING.md (`type: "working"`)
**Purpose:** Current session context

**Contents:**
- Current task and status
- Recent decisions and their rationale
- Blockers and dependencies
- Next steps when session resumes
- Open questions

**Update frequency:** Every session end

**Example:**
```markdown
# SAM — Working Memory
Last updated: 2026-02-01 10:30 UTC

## Current Task
AGT-109: Implement WORKING.md memory system per agent

## Status
In Progress — designing schema

## Recent Decisions
- Using single `agentMemory` table with `type` field (not separate tables)
- Rationale: Simpler queries, easier to add new memory types later
- Version field added for optimistic concurrency

## Blockers
None currently

## Next Steps
1. Get schema approved by Son
2. Implement Convex functions (getMemory, updateMemory)
3. Update boot protocol to read working memory

## Open Questions
- Should daily notes auto-archive after 7 days?
- Max content size for working memory?
```

---

### 3. Daily Notes (`type: "daily"`)
**Purpose:** Daily standup summaries and activity logs

**Contents:**
- What was accomplished today
- Tasks completed
- Blockers encountered
- Plan for tomorrow

**Update frequency:** End of each day (or each work session)

**Retention:** Keep 7 days, archive older

**Example:**
```markdown
# SAM — Daily Note
Date: 2026-02-01

## Completed
- [x] AGT-77: Linear API sync → Convex
- [x] AGT-72: @mention parsing - backend

## In Progress
- AGT-109: WORKING.md memory system (70%)

## Blockers
None

## Tomorrow
- Complete AGT-109 schema + functions
- Review Leo's PR for AGT-70
```

---

## Convex Functions

### `agentMemory.ts`

```typescript
// convex/agentMemory.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get agent's memory by type
export const getMemory = query({
  args: {
    agentId: v.id("agents"),
    type: v.union(v.literal("soul"), v.literal("working"), v.literal("daily")),
    date: v.optional(v.string()), // Required for daily notes
  },
  handler: async (ctx, args) => {
    if (args.type === "daily" && !args.date) {
      // Default to today
      args.date = new Date().toISOString().split("T")[0];
    }

    return await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_type", (q) =>
        q.eq("agentId", args.agentId).eq("type", args.type)
      )
      .filter((q) =>
        args.date ? q.eq(q.field("date"), args.date) : true
      )
      .first();
  },
});

// Get all memory for boot sequence
export const getBootContext = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const [soul, working, daily] = await Promise.all([
      ctx.db
        .query("agentMemory")
        .withIndex("by_agent_type", (q) =>
          q.eq("agentId", args.agentId).eq("type", "soul")
        )
        .first(),
      ctx.db
        .query("agentMemory")
        .withIndex("by_agent_type", (q) =>
          q.eq("agentId", args.agentId).eq("type", "working")
        )
        .first(),
      ctx.db
        .query("agentMemory")
        .withIndex("by_agent_date", (q) =>
          q.eq("agentId", args.agentId).eq("date", today)
        )
        .first(),
    ]);

    return { soul, working, daily };
  },
});

// Update agent's memory (with optimistic concurrency)
export const updateMemory = mutation({
  args: {
    agentId: v.id("agents"),
    type: v.union(v.literal("soul"), v.literal("working"), v.literal("daily")),
    content: v.string(),
    date: v.optional(v.string()),
    expectedVersion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_type", (q) =>
        q.eq("agentId", args.agentId).eq("type", args.type)
      )
      .filter((q) =>
        args.date ? q.eq(q.field("date"), args.date) : true
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Version check for optimistic concurrency
      if (args.expectedVersion !== undefined &&
          existing.version !== args.expectedVersion) {
        throw new Error("Version conflict — memory was updated by another session");
      }

      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: now,
        version: existing.version + 1,
      });

      return existing._id;
    } else {
      // Create new memory
      return await ctx.db.insert("agentMemory", {
        agentId: args.agentId,
        type: args.type,
        content: args.content,
        date: args.type === "daily" ? (args.date ?? new Date().toISOString().split("T")[0]) : undefined,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });
    }
  },
});

// Archive old daily notes (call from cron)
export const archiveDailyNotes = mutation({
  args: { daysToKeep: v.number() },
  handler: async (ctx, args) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - args.daysToKeep);
    const cutoffDate = cutoff.toISOString().split("T")[0];

    const oldNotes = await ctx.db
      .query("agentMemory")
      .withIndex("by_type", (q) => q.eq("type", "daily"))
      .filter((q) => q.lt(q.field("date"), cutoffDate))
      .collect();

    // For now, just delete. Future: move to archive table
    for (const note of oldNotes) {
      await ctx.db.delete(note._id);
    }

    return { archived: oldNotes.length };
  },
});
```

---

## Boot Protocol Update

The agent boot sequence (from ADR-004) should be updated:

```
Boot Sequence (updated):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Call getBootContext(agentId)
   → Returns { soul, working, daily }
2. Load SOUL.md into system context
3. Load WORKING.md into working context
4. Check @mentions (existing)
5. Check assignments (existing)
6. Act — or report HEARTBEAT_OK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Migration Notes

### Initial Data Seeding
After schema deployment, seed initial SOUL.md for each agent:

```typescript
// In seed.ts or separate migration

const agents = [
  { name: "max", role: "pm" },
  { name: "sam", role: "backend" },
  { name: "leo", role: "frontend" },
];

for (const agent of agents) {
  const agentDoc = await ctx.db
    .query("agents")
    .withIndex("by_name", (q) => q.eq("name", agent.name))
    .first();

  if (agentDoc) {
    await ctx.db.insert("agentMemory", {
      agentId: agentDoc._id,
      type: "soul",
      content: `# ${agent.name.toUpperCase()} — ${agent.role}\n\n[Initial SOUL.md - to be filled]`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });
  }
}
```

---

## Acceptance Criteria

From TICKET_GUIDELINES.md format:

- [ ] Each agent has isolated memory (Sam can't read Leo's)
- [ ] Memory persists across sessions
- [ ] Boot protocol loads working memory in under 2 seconds
- [ ] Version conflict throws error (optimistic concurrency works)
- [ ] Daily notes older than 7 days are archived
- [ ] UI shows memory content in agent detail view (Leo's task)

---

## Related

- **ADR-001:** External Persistent State for Agent Memory
- **ADR-002:** Hierarchical Memory Architecture
- **AGT-107:** SOUL.md per agent
- **AGT-109:** WORKING.md memory system
