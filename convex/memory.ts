/**
 * Semantic Memory - Phase 2: The Recall Feature
 * 
 * Provides storeMemory and searchMemory tools for agents
 * to persist and recall context across sessions.
 */
import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

// ============================================================
// STORE MEMORY
// ============================================================

/**
 * Store a memory with embedding for semantic search
 * 
 * Usage: Agent stores important context, decisions, or learnings
 */
export const storeMemory = action({
  args: {
    agentId: v.id("agents"),
    text: v.string(),
    type: v.optional(v.union(
      v.literal("soul"),
      v.literal("working"),
      v.literal("daily")
    )),
  },
  returns: v.object({
    success: v.boolean(),
    memoryId: v.id("agentMemory"),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; memoryId: Id<"agentMemory"> }> => {
    const { agentId, text, type = "working" } = args;
    
    // 1. Generate embedding
    const embedding: number[] = await ctx.runAction(internal.actions.embeddings.generateEmbedding, {
      text,
    });
    
    // 2. Store memory with embedding
    const memoryId: Id<"agentMemory"> = await ctx.runMutation(internal.memory.insertMemory, {
      agentId,
      content: text,
      type,
      embedding,
    });
    
    return { success: true, memoryId };
  },
});

/**
 * Internal mutation to insert memory
 */
export const insertMemory = internalMutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
    type: v.union(
      v.literal("soul"),
      v.literal("working"),
      v.literal("daily")
    ),
    embedding: v.array(v.float64()),
  },
  returns: v.id("agentMemory"),
  handler: async (ctx, args): Promise<Id<"agentMemory">> => {
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    return await ctx.db.insert("agentMemory", {
      agentId: args.agentId,
      content: args.content,
      type: args.type,
      embedding: args.embedding,
      date: args.type === "daily" ? today : undefined,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
  },
});

// ============================================================
// SEARCH MEMORY
// ============================================================

// Result type for memory search
const memoryResultValidator = v.object({
  _id: v.id("agentMemory"),
  content: v.string(),
  type: v.string(),
  date: v.optional(v.string()),
  createdAt: v.number(),
  score: v.number(),
});

type MemoryResult = {
  _id: Id<"agentMemory">;
  content: string;
  type: string;
  date?: string;
  createdAt: number;
  score: number;
};

/**
 * Search agent memories using vector similarity
 * 
 * Usage: Agent recalls relevant past context before answering
 */
export const searchMemory = action({
  args: {
    agentId: v.id("agents"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(memoryResultValidator),
  handler: async (ctx, args): Promise<MemoryResult[]> => {
    const { agentId, query, limit = 5 } = args;
    
    // 1. Generate embedding for query
    const queryEmbedding: number[] = await ctx.runAction(internal.actions.embeddings.generateEmbedding, {
      text: query,
    });
    
    // 2. Search memories using vector search
    const results: MemoryResult[] = await ctx.runQuery(internal.memory.vectorSearchInternal, {
      agentId,
      embedding: queryEmbedding,
      limit,
    });
    
    return results;
  },
});

/**
 * Internal query for vector search
 * Uses Convex vector search API
 */
export const vectorSearchInternal = internalQuery({
  args: {
    agentId: v.id("agents"),
    embedding: v.array(v.float64()),
    limit: v.number(),
  },
  returns: v.array(memoryResultValidator),
  handler: async (ctx, args): Promise<MemoryResult[]> => {
    // Use Convex vector search
    const results = await ctx.db
      .query("agentMemory")
      .withSearchIndex("by_embedding", (q) =>
        q.vectorSearch("embedding", args.embedding).eq("agentId", args.agentId)
      )
      .take(args.limit);
    
    // Map to return format with score
    return results.map((memory, index) => ({
      _id: memory._id,
      content: memory.content,
      type: memory.type,
      date: memory.date,
      createdAt: memory.createdAt,
      // Approximate score based on order (Convex returns ordered by similarity)
      score: 1 - (index * 0.1),
    }));
  },
});

// ============================================================
// UTILITY QUERIES
// ============================================================

/**
 * Get all memories for an agent (for debugging/admin)
 */
export const listMemories = query({
  args: {
    agentId: v.id("agents"),
    type: v.optional(v.union(
      v.literal("soul"),
      v.literal("working"),
      v.literal("daily")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("agentMemory")
      .withIndex("by_agent_type", (q) => {
        if (args.type) {
          return q.eq("agentId", args.agentId).eq("type", args.type);
        }
        return q.eq("agentId", args.agentId);
      })
      .order("desc");
    
    const memories = args.limit ? await q.take(args.limit) : await q.collect();
    
    // Don't return embeddings to save bandwidth
    return memories.map(m => ({
      _id: m._id,
      content: m.content,
      type: m.type,
      date: m.date,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  },
});
