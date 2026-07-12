/**
 * Scaleway model definitions
 * 
 * Curated list of stable, popular models available via Scaleway's Serverless API.
 * Model IDs verified against Scaleway's documentation (May 2026).
 * 
 * Future enhancement: Replace with dynamic discovery via GET /v1/models
 */

import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent/compat";

/**
 * Default models to use when dynamic discovery is unavailable.
 * Selected for stability, popularity, and Serverless availability.
 */
export const DEFAULT_MODELS: ProviderModelConfig[] = [
  {
    // OpenAI's open-weight model with reasoning capabilities
    id: "openai/gpt-oss-120b:fp4",
    name: "GPT OSS 120B",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  {
    // Qwen's state-of-the-art small model with vision support
    id: "qwen/qwen3.6-35b-a3b:bf16",
    name: "Qwen 3.6 35B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
    // Mistral's optimized small model for tool calling
    id: "mistral/mistral-small-3.2-24b-instruct-2506:fp8",
    name: "Mistral Small 3.2",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  {
    // Google's frontier model with MoE architecture
    id: "google/gemma-4-26b-a4b-it:bf16",
    name: "Gemma 4 26B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
    // Mistral's unified medium model for reasoning and coding
    id: "mistral/mistral-medium-3.5-128b:fp8",
    name: "Mistral Medium 3.5",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 16_000
  }
];

/**
 * Discover available models from Scaleway's API.
 * 
 * Future enhancement: Call GET /v1/models to get current catalog.
 * For now, returns default models.
 * 
 * @param _apiKey - Scaleway API key
 * @returns Promise resolving to list of available models
 */
export async function discoverModels(_apiKey: string): Promise<ProviderModelConfig[]> { // eslint-disable-line @typescript-eslint/no-unused-vars
  // TODO: Implement dynamic discovery
  // const response = await fetch('https://api.scaleway.ai/v1/models', {
  //   headers: { 'Authorization': `Bearer ${apiKey}` }
  // });
  // const data = await response.json();
  // return mapApiModels(data.data, DEFAULT_MODELS);
  
  // For MVP, return static defaults
  return DEFAULT_MODELS;
}

/**
 * Get models, attempting discovery first and falling back to defaults.
 * 
 * @param apiKey - Scaleway API key
 * @returns Promise resolving to list of available models
 */
export async function getModels(apiKey: string): Promise<ProviderModelConfig[]> {
  try {
    return await discoverModels(apiKey);
  } catch (error) {
    console.warn('[Scaleway] Model discovery failed, using defaults:', error);
    return DEFAULT_MODELS;
  }
}
