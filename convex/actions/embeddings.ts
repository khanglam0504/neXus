"use node";

/**
 * Embedding Actions - Phase 2: Semantic Memory
 * 
 * Uses Google Gemini text-embedding-004 (768 dimensions)
 * for vector search on agent memory.
 */
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate embedding vector for text
 * Returns 768-dimensional vector (Gemini text-embedding-004)
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
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(args.text);
    return result.embedding.values;
  },
});
