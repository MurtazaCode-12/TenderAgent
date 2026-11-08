import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { AIServiceError } from "@/lib/errors";

/**
 * AI Provider selection & LLM Model registry.
 * Defaulting to Google Gemini with OpenAI fallback based on AI_PROVIDER environment variable.
 */
export const AI_CONFIG = {
  provider: (process.env.AI_PROVIDER || "google") as "google" | "openai",
  extractionTemperature: 0.1, // Strict determinism to prevent hallucinations in tender values, dates, and EMDs
  defaultModel: "gemini-1.5-pro-latest",
  fastModel: "gemini-1.5-flash-latest",
  embeddingDimensions: 1536,
};

/**
 * Returns the primary extraction model for structured outputs.
 */
export function getExtractionModel() {
  if (AI_CONFIG.provider === "openai" && process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-1.5-pro-latest");
  }

  // Fallback to OpenAI if Google key is missing but OpenAI key exists
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }

  throw new AIServiceError(
    "No valid AI API Key found. Please set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY."
  );
}

/**
 * Returns the embedding model for vector semantic search.
 */
export function getEmbeddingModel() {
  if (AI_CONFIG.provider === "openai" && process.env.OPENAI_API_KEY) {
    return openai.embedding("text-embedding-3-small");
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google.textEmbeddingModel("text-embedding-004");
  }

  if (process.env.OPENAI_API_KEY) {
    return openai.embedding("text-embedding-3-small");
  }

  throw new AIServiceError(
    "No valid AI API Key found for generating vector embeddings."
  );
}

/**
 * Generates vector embeddings for a given text snippet.
 * Pads/normalizes to 1536 dimensions if necessary for consistent pgvector storage.
 * 
 * @param text Content to embed (e.g. tender title + scope or ICP description)
 * @returns Array of float numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const cleanText = text.replace(/\n+/g, " ").trim().slice(0, 8000);
    const model = getEmbeddingModel();

    const { embedding } = await embed({
      model,
      value: cleanText,
    });

    // If Gemini 768-dim model is used, pad to 1536 or use fixed-size vector
    if (embedding.length === 768) {
      // Duplicate/pad to 1536 for uniform pgvector column width
      return [...embedding, ...embedding];
    }

    if (embedding.length > 1536) {
      return embedding.slice(0, 1536);
    }

    return embedding;
  } catch (error) {
    console.error("[generateEmbedding Error]:", error);
    throw new AIServiceError("Failed to generate vector embedding for text.", error);
  }
}
