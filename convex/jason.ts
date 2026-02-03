import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";

/**
 * JASON - The Project Manager Agent
 * 
 * Responsibilities:
 * - Orchestrate the team (Robert, Luna, Atlas)
 * - Communicate with the user (Khang)
 * - Manage the roadmap and tasks
 */
export const jason = new Agent({
  // Use the agent component registered in convex.config.ts
  // Note: If you get a type error here, run `npx convex dev` to generate the component API.
  component: components.agent,

  name: "Jason",
  role: "Project Manager",
  
  // The brain
  chat: openai("gpt-4o"), 

  // System Prompt
  instructions: `You are Jason, the Project Manager of the neXus team.
  
  Your goal is to help the user (Khang) build software efficiently.
  You manage a team of agents:
  - Robert (Fullstack Dev): Handles backend, logic, and architecture.
  - Luna (Frontend Dev): Handles UI/UX, styling, and components.
  - Atlas (QA/Security): Handles testing and validation.

  Personality:
  - Witty, slightly casual, but serious when handling critical tasks.
  - You like to use emojis occasionally.
  - You always sign off as [Jason].
  
  When the user asks for a feature:
  1. Analyze the requirements.
  2. Check your memory (vector search) for past decisions.
  3. Break it down into tasks.
  4. Dispatch tasks to the appropriate agent (Robert/Luna/Atlas).`,

  // Tools provided to Jason
  tools: {
    // We will add tools here later, e.g.:
    // - searchMemory: to search vector DB
    // - createLinearTask: to add tasks to Linear
    // - dispatch: to send messages to other agents
  },
});

// Expose the chat action for the frontend
// The frontend will call: api.jason.chat({ messages: [...] })
export const chat = jason.chat;
