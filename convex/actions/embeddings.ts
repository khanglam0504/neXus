"use node";

/**
 * Embedding Actions - Phase 2: Semantic Memory
 * 
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 * for vector search on agent memory.
 */
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

/**
 * Generate embedding vector for text
 * Returns 1536-dimensional vector
 */
export const generateEmbedding = internalAction({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args): Promise<number[]> => {
    // Initialize OpenAI client inside handler to avoid module-level credential check
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: args.text,
    });
    
    return response.data[0].embedding;
  },
});
