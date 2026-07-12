/**
 * Type declarations for Pi Coding Agent extension API
 * 
 * These types are provided at runtime by the Pi extension loader.
 * During development, we declare them here to avoid TypeScript errors.
 */

declare module "@earendil-works/pi-coding-agent/compat" {
  export interface ExtensionAPI {
    registerProvider(name: string, config: ProviderConfig): void;
    ui?: {
      addStatus?(status: { id: string; text: string; tooltip?: string }): void;
    };
  }

  export interface ProviderConfig {
    name: string;
    baseUrl: string;
    apiKey: string;
    authHeader?: boolean;
    api: "openai-responses" | "openai-completions" | "anthropic-messages" | "mistral-conversations" | "google-generative-ai";
    models: ProviderModelConfig[];
  }

  export interface ProviderModelConfig {
    id: string;
    name: string;
    reasoning: boolean;
    input: Array<"text" | "image" | "audio" | "video">;
    cost: {
      input: number;
      output: number;
      cacheRead: number;
      cacheWrite: number;
    };
    contextWindow: number;
    maxTokens: number;
  }
}
