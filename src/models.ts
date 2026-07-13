/**
 * Scaleway model definitions
 *
 * Purely static model list sourced from Scaleway's official documentation:
 * https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/
 * Reviewed: May 26, 2026
 *
 * Only serverless-available chat/generation models are included.
 * Non-chat models (whisper-large-v3, qwen3-embedding-8b, bge-multilingual-gemma2),
 * EOL for Serverless models, and dedicated-only models are excluded.
 */

import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent/compat";

/**
 * Models that must use the OpenAI *responses* API instead of the default
 * chat‑completion API. Currently the only model that needs this is the
 * OSS 120B model.
 */
export const RESPONSE_API_MODELS = new Set<string>([
  "gpt-oss-120b"
]);

/**
 * Static list of all serverless chat/generation models available on Scaleway.
 * Source: Scaleway docs (Reviewed May 26, 2026)
 *
 * Excluded:
 * - whisper-large-v3 (audio transcription, not a chat model)
 * - qwen3-embedding-8b, bge-multilingual-gemma2 (embedding models)
 * - Models marked "EOL for Serverless" or "No" in the serverless column
 */
export const DEFAULT_MODELS: ProviderModelConfig[] = [
  // ── OpenAI ────────────────────────────────────────────────────────────
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    api: "openai-responses",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },

  // ── Qwen ──────────────────────────────────────────────────────────────
  {
    id: "qwen3.6-35b-a3b",
    name: "Qwen 3.6 35B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
    id: "qwen3.5-397b-a17b",
    name: "Qwen 3.5 397B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 250_000,
    maxTokens: 16_000
  },
  {
    id: "qwen3-235b-a22b-instruct-2507",
    name: "Qwen 3 235B Instruct",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 250_000,
    maxTokens: 16_000
  },
  {
    id: "qwen3-coder-30b-a3b-instruct",
    name: "Qwen 3 Coder 30B",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },

  // ── Google / Gemma ────────────────────────────────────────────────────
  {
    id: "gemma-4-26b-a4b-it",
    name: "Gemma 4 26B",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 32_000
  },
  {
    id: "gemma-3-27b-it",
    name: "Gemma 3 27B",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 40_000,
    maxTokens: 8_000
  },

  // ── Meta / Llama ──────────────────────────────────────────────────────
  {
    id: "llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 100_000,
    maxTokens: 16_000
  },

  // ── Mistral ───────────────────────────────────────────────────────────
  {
    id: "mistral-small-3.2-24b-instruct-2506",
    name: "Mistral Small 3.2",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  {
    id: "mistral-medium-3.5-128b",
    name: "Mistral Medium 3.5",
    reasoning: true,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 180_000,
    maxTokens: 16_000
  },
  {
    id: "voxtral-small-24b-2507",
    name: "Voxtral Small 24B",
    reasoning: false,
    input: ["text", "audio"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 32_000,
    maxTokens: 16_000
  },
  {
    id: "devstral-2-123b-instruct-2512",
    name: "Devstral 2 123B",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200_000,
    maxTokens: 16_000
  },
  {
    id: "pixtral-12b-2409",
    name: "Pixtral 12B",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 4_000
  },

  // ── Z.ai ──────────────────────────────────────────────────────────────
  {
    id: "glm-5.2",
    name: "GLM 5.2",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 256_000,
    maxTokens: 16_000
  },

  // ── H Company ─────────────────────────────────────────────────────────
  {
    id: "holo2-30b-a3b",
    name: "Holo2 30B",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 22_000,
    maxTokens: 32_000
  }
];

/**
 * Determines which API type to use for a given model ID.
 * OSS 120B model requires the responses API, all others use completions.
 */
export function getApiForModel(modelId: string): "openai-completions" | "openai-responses" {
  return RESPONSE_API_MODELS.has(modelId) ? "openai-responses" : "openai-completions";
}

/**
 * Returns the list of available models.
 *
 * This is a synchronous static lookup — no network calls.
 * All model metadata is curated from Scaleway's official documentation.
 */
export function getModels(): ProviderModelConfig[] {
  // Apply per-model API assignments before returning
  return DEFAULT_MODELS.map(model => ({
    ...model,
    api: model.api ?? getApiForModel(model.id)
  }));
}
