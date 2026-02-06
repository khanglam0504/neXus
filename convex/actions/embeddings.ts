"use node";

/**
 * Embedding Actions - Phase 2: Semantic Memory
 * 
 * Uses Google Gemini embedding-001 (768 dimensions)
 * for vector search on agent memory.
 */
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Generate embedding vector for text
 * Returns 768-dimensional vector (Gemini embedding-001)
 */
export const generateEmbedding = internalAction({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args): Promise<number[]> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    
    // Use REST API directly for embeddings
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text: args.text }],
          },
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }
    
    const data = await response.json();
    return data.embedding.values;
  },
});
