/**
 * Scaleway model definitions
 * 
 * Curated list of stable, popular models available via Scaleway's Serverless API.
 * Model IDs verified against Scaleway's documentation (May 2026).
 * 
 * Uses the /v1/models endpoint for dynamic discovery.
 */

import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent/compat";

/**
 * Default models to use when dynamic discovery is unavailable.
 * Selected for stability, popularity, and Serverless availability.
 */
export const DEFAULT_MODELS: ProviderModelConfig[] = [
  {
    id: "openai/gpt-oss-120b:fp4",
    name: "GPT OSS 120B",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  {
    id: "qwen/qwen3.6-35b-a3b:bf16",
    name: "Qwen 3.6 35B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
    id: "mistral/mistral-small-3.2-24b-instruct-2506:fp8",
    name: "Mistral Small 3.2",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  {
    id: "google/gemma-4-26b-a4b-it:bf16",
    name: "Gemma 4 26B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
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
 * Scaleway /v1/models API response shape (per models.md)
 */
interface ScalewayModelsResponse {
  object: "list";
  data: ScalewayModel[];
}

interface ScalewayModel {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

/**
 * Normalizes the Scaleway /v1/models response into an array of ScalewayModel.
 * Expects the OpenAI-style list format: { object: "list", data: [...] }
 */
function normalizeModels(raw: unknown): ScalewayModel[] {
  if (raw === null || typeof raw !== 'object') {
    return [];
  }
  const response = raw as Partial<ScalewayModelsResponse>;
  if (response.object !== "list" || !Array.isArray(response.data)) {
    console.warn('[Scaleway] Unexpected /v1/models response shape:', raw);
    return [];
  }
  // Validate each model entry has required fields
  return response.data.filter((m): m is ScalewayModel =>
    m !== null &&
    typeof m === 'object' &&
    typeof m.id === 'string' &&
    m.object === 'model' &&
    typeof m.created === 'number' &&
    typeof m.owned_by === 'string'
  );
}

/**
 * Infers provider and quantization from model ID.
 * Scaleway model IDs follow patterns like:
 * - "llama-3.3-70b-instruct" (provider inferred from owned_by)
 * - "pydantic-70b-instruct:bf16" (quantization suffix present)
 */
function parseModelId(modelId: string, ownedBy: string): { provider: string; modelId: string; quantization: string } {
  const quantizationMatch = modelId.match(/^(.+):([a-z0-9]+)$/);
  let quantization = 'fp4';
  let cleanModelId = modelId;
  
  if (quantizationMatch) {
    cleanModelId = quantizationMatch[1];
    quantization = quantizationMatch[2];
  }
  
  // Infer provider from owned_by field
  const provider = ownedBy || 'openai';
  
  return { provider, modelId: cleanModelId, quantization };
}

/**
 * Discover available models from Scaleway's API.
 * 
 * Calls GET /v1/models to get current catalog from Scaleway.
 * Returns models with provider-prefixed IDs for Pi's model registry.
 * 
 * @param apiKey - Scaleway API key
 * @returns Promise resolving to list of available models
 */
export async function discoverModels(apiKey: string): Promise<ProviderModelConfig[]> {
  try {
    const response = await fetch('https://api.scaleway.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const rawModels = await response.json();
    const models: ScalewayModel[] = normalizeModels(rawModels);
    
    if (models.length === 0) {
      console.warn('[Scaleway] No models returned from API, using defaults');
      return DEFAULT_MODELS;
    }
    
    // Transform to Pi's ProviderModelConfig format
    return models.map((m: ScalewayModel) => {
      const { provider, modelId, quantization } = parseModelId(m.id, m.owned_by);
      return {
        id: `${provider}/${modelId}:${quantization}`,
        name: `${provider}/${modelId}`,
        reasoning: true,
        input: ['text', 'image'],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128_000,
        maxTokens: 32_000
      };
    });
  } catch (error) {
    console.error('Model discovery failed:', error);
    return DEFAULT_MODELS;
  }
}

/**
 * Get models, attempting discovery first and falling back to defaults.
 * 
 * @param apiKey - Scaleway API key
 * @returns Promise resolving to list of available models
 */
export async function getModels(apiKey: string): Promise<ProviderModelConfig[]> {
  return discoverModels(apiKey);
}