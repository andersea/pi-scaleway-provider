# Scaleway Generative AI Extension for Pi

A minimal Pi extension that registers Scaleway's Generative APIs as a native Pi provider.

## Installation

```bash
# Production — install via npm (recommended)
pi install npm:@andersea/pi-scaleway-gen

# Or install from git
pi install git:github.com/andersea/pi-scaleway-provider

# Development — load directly from source
pi -e ./src/index.ts
```

## Configuration

### Required Environment Variable

Set your Scaleway API key before running Pi:

```bash
export SCW_SECRET_KEY="scw_..."
```

> 💡 **Note**: `SCW_SECRET_KEY` is the official Scaleway convention. Get your API key from [Scaleway Console → Credentials → API Keys](https://console.scaleway.com/credentials/api-keys).

## Usage

### Select a Scaleway Model

```bash
# List available Scaleway models
/model scaleway/

# Use a specific model
/model scaleway/gpt-oss-120b
```

### Example Prompts

```bash
# Simple query with GPT OSS 120B
/model scaleway/gpt-oss-120b "Write a haiku about AI"

# Code generation with Qwen (supports vision)
/model scaleway/qwen3.6-35b-a3b "Write a Python function to sort a list"

# Image analysis with Mistral Small
/model scaleway/mistral-small-3.2-24b-instruct-2506 "What's in this image?" @image.png

# Complex reasoning with Gemma
/model scaleway/gemma-4-26b-a4b-it "Explain quantum entanglement"
```

### API Selection Behavior

All Scaleway models are accessed using the OpenAI **chat completions** API (`openai-completions`). The provider registers with this as the default API — no per-model overrides are needed.

> 📌 **Note**: Model availability may change. Run `/model scaleway/` to see currently available models. Models are defined statically in `src/models.ts`, sourced from Scaleway's official documentation.

## Troubleshooting

### Extension doesn't load
```
[Scaleway] Missing API key. Set SCW_SECRET_KEY environment variable.
```
**Solution:** Set the environment variable before starting Pi:
```bash
export SCW_SECRET_KEY="scw_..."
pi
```

### 401 Unauthorized
```
Authentication failed
```
**Solution:** 
- Verify your API key is correct
- Ensure the key has `GenerativeApisModelAccess` permission
- Check the key hasn't expired

### Model not found
```
Model 'xxx' not found
```
**Solution:** 
- Use `/model scaleway/` to list available models
- Verify the model ID matches exactly (e.g. `gpt-oss-120b`, `qwen3.6-35b-a3b`)
- Check Scaleway's documentation for current model availability

### 429 Rate Limited
```
Too many requests
```
**Solution:** 
- Wait before retrying
- Request higher limits in Scaleway console

## Development

```bash
# Install dependencies
npm install

# Build (optional - jiti loads TS directly)
npm run build

# Lint
npm run lint

# Test with Pi
SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts
```

## Architecture

This extension uses Pi's **provider registration** pattern:

```typescript
pi.registerProvider("scaleway", {
  name: "Scaleway Generative AI",
  baseUrl: "https://api.scaleway.ai/v1",
  apiKey: config.apiKey,
  authHeader: true,
  api: "openai-completions",
  models: getModels()
});
```

All Scaleway models use the `openai-completions` API — including `gpt-oss-120b`, which the Scaleway docs suggest must use the Responses API. In practice, Scaleway's `/v1/responses` endpoint rejects the `include` field that Pi sends for reasoning models, so all models are routed through chat completions.

Benefits of this approach:
- Native Pi integration (`/model scaleway/...`)
- Leverages Pi's built-in streaming and error handling
- Minimal code (~50 lines)

### Model Management

Models are defined in `src/models.ts` as a static, curated list sourced from [Scaleway's supported models page](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/).

Only serverless chat/generation models are included — non-chat models (audio, embeddings), EOL models, and dedicated-only models are excluded.

## Future Enhancements

- [ ] Dynamic model discovery from `/v1/models` endpoint
- [ ] Model metadata caching with 24h refresh
- [ ] `/scaleway-refresh-models` command
- [ ] Token usage tracking
- [ ] Per-model cost configuration

## License

MIT
