# Scaleway Generative AI Extension — Agent Guide

This file helps AI agents work on this project. Four things to know:

## 1. How Pi Extensions Work

Pi extensions are TypeScript modules that export a default function receiving `ExtensionAPI`. Read these files from the pi package (available in `node_modules/` once installed):

| Topic | File (relative to pi package root) |
|-------|-------------------------------------|
| Extensions overview | `docs/extensions.md` |
| Custom providers (registerProvider) | `docs/custom-provider.md` |
| Provider model definitions | `docs/providers.md` |
| Extension examples | `examples/extensions/` |
| All docs | `docs/index.md` |

Or online: [pi.dev/docs/extensions](https://pi.dev/docs/extensions)

## 2. How Provider Registration Works

This extension calls `pi.registerProvider("scaleway", {...})` in `src/index.ts` with:
- `baseUrl`: `https://api.scaleway.ai/v1`
- `apiKey`: from `SCW_SECRET_KEY` env var
- `api`: `"openai-completions"` (default for every model)
- `models`: an array of `ProviderModelConfig` objects from `src/models.ts`

**No model sets a per-model `api` override.** All Scaleway models — including
`gpt-oss-120b` — use the provider-level default `"openai-completions"`.

### gpt-oss-120b exception

Scaleway's docs state that `gpt-oss-120b` must be accessed via the Responses
API (`openai-responses`). **This extension deliberately does NOT do that.**

When routed through `openai-responses`, Pi's adapter (in
`@earendil-works/pi-ai`, `openai-responses.js`) sends the field:
```json
"include": ["reasoning.encrypted_content"]
```
whenever a reasoning effort is set (i.e. any non-"off" thinking level, which is
the default for this reasoning model). Scaleway's `/v1/responses` endpoint does
**not support the `include` field at all** and rejects the request:
```
400 BAD REQUEST — "payload validation: 'include' is not supported"
```

There is no compat flag in the current pi version to suppress `include`.
Scaleway's `/v1/chat/completions` endpoint, by contrast, serves `gpt-oss-120b`
correctly with tools, system prompts, and reasoning tokens. So the model is
routed through `openai-completions` like every other Scaleway model. This is an
deliberate, documented deviation from the Scaleway docs.

**If this changes in the future** (Scaleway adds `include` support, or pi-ai
exposes a compat flag to drop it), `gpt-oss-120b` can be moved back to
`openai-responses` by adding `api: "openai-responses"` to its entry in
`src/models.ts` and updating the test in `src/models.test.ts`.

The type definitions are in `src/types.d.ts` (augments `@earendil-works/pi-coding-agent/compat`).

## 3. Where the Model List Comes From

Models are defined statically in `src/models.ts` — a curated list of **serverless chat/generation models only**. The source of truth is Scaleway's docs:

- **Supported models page:** https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/
- **Current list reviewed:** May 26, 2026 (check the "Reviewed on" badge on that page)

Excluded from the static list:
- **Non-chat models** — `whisper-large-v3` (audio), `qwen3-embedding-8b`, `bge-multilingual-gemma2` (embeddings)
- **EOL for Serverless** — models marked "EOL for Serverless" in the docs table
- **Dedicated-only** — models only available via dedicated deployment (not serverless)

Each model entry includes: `id`, `name`, `reasoning`, `input` modalities, `cost`, `contextWindow`, `maxTokens`. All costs are currently `0`.

Pi type for model entries: `ProviderModelConfig` from `@earendil-works/pi-coding-agent/compat`.

## 4. Maintenance

When Scaleway adds or removes serverless models:

1. Open the [supported models page](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/) and verify the "Reviewed on" date
2. Add/remove entries in `src/models.ts` following the existing pattern
3. Update the "Reviewed" date in `src/models.ts` header comment
4. Update tests in `src/models.test.ts` — specifically the "contains all expected serverless chat models" test
5. Run `npm test` to verify

**When NOT to update the model list:**
- New dedicated-only models (not available via serverless)
- New embedding or audio transcription models (non-chat)
- Models marked "EOL for Serverless"

**Also update** `src/models.md` if the `/v1/models` API response format itself changes (this is a reference document, not code).

Never fetch or scrape Scaleway's docs page programmatically — the model list is statically curated by hand.