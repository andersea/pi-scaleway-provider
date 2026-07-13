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
 *
 * NOTE: Scaleway's OpenAI-compatible chat completions API does NOT universally
 * support the `developer` role. Models like qwen3.5-397b-a17b and
 * mistral-medium-3.5-128b reject `role: "developer"` with a 400 "Unexpected
 * message role" error. All models do accept `role: "system"` though.
 * We set `supportsDeveloperRole: false` via compat to force `role: "system"`.
 *
 * NOTE: `gpt-oss-120b` is an EXCEPTION — see the model entry below and the
 * "gpt-oss-120b exception" note in AGENTS.md for the full rationale.
 */

import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent/compat";

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
  //
  // EXCEPTION: gpt-oss-120b uses the openai-completions API, NOT openai-responses.
  //
  // Scaleway's docs state gpt-oss-120b requires the Responses API, but in
  // practice Scaleway's /v1/responses endpoint rejects the `include` field:
  //   { "status":400, "error":"BAD REQUEST",
  //     "message":"payload validation: 'include' is not supported" }
  //
  // Pi's openai-responses adapter sends `include: ["reasoning.encrypted_content"]`
  // whenever a reasoning effort is set (see pi-ai's openai-responses.js), and
  // there is no compat flag to suppress it in the current pi version. As a
  // result, every reasoning request to gpt-oss-120b via /v1/responses 400s.
  //
  // The chat completions endpoint serves gpt-oss-120b correctly with tools,
  // system prompts, and reasoning tokens, so we route it through
  // openai-completions like every other Scaleway model. No `api` override is
  // set — the provider-level default (openai-completions) applies.
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    reasoning: true,
    thinkingLevelMap: { off: null },
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
 * Returns the list of available models.
 *
 * This is a synchronous static lookup — no network calls.
 * All model metadata is curated from Scaleway's official documentation.
 *
 * All models use the provider-level default API ("openai-completions"). No
 * model sets a per-model `api` override — see the "gpt-oss-120b exception"
 * note in AGENTS.md and the model entry comment for why gpt-oss-120b is NOT
 * routed through openai-responses despite the Scaleway docs suggesting so.
 *
 * All models get `compat: { supportsDeveloperRole: false }` injected so that
 * Pi uses `role: "system"` instead of `role: "developer"` for system prompts.
 * Scaleway does not universally support the `developer` role — models like
 * qwen3.5-397b-a17b and mistral-medium-3.5-128b return a 400 error for it.
 */
export function getModels(): ProviderModelConfig[] {
  return DEFAULT_MODELS.map((m) => ({
    ...m,
    compat: { ...m.compat, supportsDeveloperRole: false },
  }));
}
