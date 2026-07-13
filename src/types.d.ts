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
    /**
     * Optional API type for this specific model. If omitted, the provider's default API applies.
     */
    api?: "openai-completions" | "openai-responses";
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
    /**
     * Maps pi thinking levels to provider/model-specific values; null marks a level unsupported.
     */
    thinkingLevelMap?: Record<string, string | null>;
    /**
     * OpenAI compatibility settings (e.g., supportsDeveloperRole).
     * Added to all models to force role: "system" over role: "developer",
     * since Scaleway does not universally support the developer role.
     */
    compat?: {
      supportsDeveloperRole?: boolean;
      supportsStore?: boolean;
      supportsReasoningEffort?: boolean;
    };
  }
}
