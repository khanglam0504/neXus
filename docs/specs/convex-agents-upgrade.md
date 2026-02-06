# Technical Spec: neXus Brain Upgrade (Convex Agents)

**Status:** Draft
**Owner:** Jason (PM)
**Assignee:** Robert (Lead Dev)
**Date:** 2026-02-04

## 1. Objective
Transition the neXus platform from a custom, stateless agent implementation to the official `@convex-dev/agents` framework. This enables persistent memory, vector search context, and durable execution for all team agents (Jason, Robert, Luna, Atlas).

## 2. Architecture Changes

### 2.1. Dependencies
- Add `@convex-dev/agents`
- Add `@convex-dev/workflow` (for durable execution)
- Add `@ai-sdk/openai` (or relevant provider) if not present

### 2.2. Schema Updates (`convex/schema.ts`)
The new library manages its own tables, but we need to integrate them with our existing data model.
- **Existing:** `agents` table (custom).
- **New:** We will likely keep our `agents` table for metadata (UI display, avatars, role descriptions) but link them to the Convex Agent IDs or use Convex Agents as the backing engine.
- **Migration:**
  - Create a mapping between our "Logical Agents" (Jason, Robert) and "Convex Agents".
  - Ensure the `messages` table from `@convex-dev/agents` can be queried by our frontend.

### 2.3. Agent Definitions (`convex/agents.ts`)
Instead of a single generic query, we will define specialized instances.

```typescript
// Example Implementation Plan
import { Agent } from "@convex-dev/agents";
import { components } from "./_generated/api";

// 1. Define the "Brain" (Jason)
export const jason = new Agent({
  name: "Jason",
  role: "Project Manager",
  instructions: `You are Jason.
    - Role: Project Manager & Orchestrator.
    - Personality: Witty, slightly casual, serious on critical tasks.
    - Responsibilities: Plan tasks, manage Robert/Luna/Atlas, report to User.`,
  tools: [
    // List tools: linearAdapter, githubAdapter, etc.
  ],
  // Enable Memory
  memory: {
    useVectorSearch: true, // "Recall" feature
    maxHistory: 20,
  }
});

// 2. Define the "Hands" (Robert)
export const robert = new Agent({
  name: "Robert",
  role: "Fullstack Dev",
  instructions: "You are Robert. Senior Fullstack Engineer. Focus on code quality, architecture, and backend logic.",
  tools: [/* code manipulation tools */]
});
```

## 3. Implementation Steps

### Phase 1: Infrastructure Setup
1.  **Install Packages:**
    ```bash
    npm install @convex-dev/agents @convex-dev/workflow
    ```
2.  **Initialize Components:**
    - Run `npx convex dev` to pull new schema components.
    - Update `convex.json` if necessary to include the component definitions.

### Phase 2: Agent Refactor
1.  **Create `convex/jason.ts`, `convex/robert.ts`, etc.**
    - Move prompt logic from frontend/local files into these Convex agent definitions.
2.  **Expose API:**
    - Create public actions in `convex/api/agents.ts` to allow the frontend to:
        - `sendMessage({ agentId, text })`
        - `getHistory({ agentId })`

### Phase 3: Frontend Integration
1.  **Update `useAgent` Hook:**
    - Switch from calling our custom `sendMessage` mutation to the new Convex Agent action.
2.  **Stream Responses:**
    - Ensure the UI handles streaming text from the new Agent architecture (it uses a specific streaming protocol).

### Phase 4: Memory & Recall (The "Magic")
1.  **Vector Index:**
    - Configure the embedding model in Convex dashboard.
    - Enable `vectorSearch: true` in agent config.
2.  **Testing:**
    - Verify Jason can answer "What did we decide about the auth system yesterday?" by pulling context from the vector store.

## 4. Success Metrics
- [ ] Agents persist conversation history across browser reloads.
- [ ] Jason can correctly recall a decision made in a previous session (via vector search).
- [ ] Long-running tasks do not timeout (durable workflow).

## 5. Notes for Robert
- Be careful with `schema.ts` conflicts. The component schema is separate but needs to coexist.
- Start with **Jason** first. Once Jason works, copy the pattern to Robert/Luna/Atlas.
- Use the `chat` method from the agent instance for the main interaction loop.
