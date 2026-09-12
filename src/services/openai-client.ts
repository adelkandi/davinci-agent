import { requireEnv } from "@/lib/env";

/**
 * Generic OpenAI client factory. Not wired to any DaVinci prompt, tool,
 * or workflow today — implemented during the hackathon.
 */

export function getOpenAIConfig() {
  return {
    apiKey: requireEnv("OPENAI_API_KEY"),
  };
}
