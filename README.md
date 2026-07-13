# Scaleway Generative AI Extension for Pi

A minimal Pi extension that registers Scaleway's Generative APIs as a native Pi provider.

## Installation

```bash
# Install from local development copy
pi -e /path/to/pi-scaleway-provider

# Or install from npm/git (when published)
pi install npm:pi-scaleway-gen
pi install git:github.com/username/pi-scaleway-gen
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
/model scaleway/openai/gpt-oss-120b:fp4
```

### Example Prompts

```bash
# Simple query with GPT OSS 120B
/model scaleway/openai/gpt-oss-120b:fp4 "Write a haiku about AI"

# Code generation with Qwen (supports vision)
/model scaleway/qwen/qwen3.6-35b-a3b:bf16 "Write a Python function to sort a list"

# Image analysis with Mistral Small
/model scaleway/mistral/mistral-small-3.2-24b-instruct-2506:fp8 "What's in this image?" @image.png

# Complex reasoning with Gemma
/model scaleway/google/gemma-4-26b-a4b-it:bf16 "Explain quantum entanglement"
```

## API Selection Behavior

By default, all Scaleway models are accessed using the OpenAI **chat completions** API (`openai-completions`). However, certain models may require the **responses** API instead. The extension defines a constant `RESPONSE_API_MODELS` that contains the identifiers of models needing the responses API. Currently, the only model in this set is `openai/gpt-oss-120b:fp4`.

When a model ID matches an entry in `RESPONSE_API_MODELS`, the extension selects the `openai-responses` API for that specific model. All other models continue to use `openai-completions`. This per‑model selection is transparent to the user; you simply address the model by its full ID (e.g., `scaleway/openai/gpt-oss-120b:fp4`).

This approach allows the provider to keep the default API as `openai-completions` (which covers the vast majority of models) while correctly handling the special cases that require the responses API.

> 📌 **Note**: Model availability may change. Run `/model scaleway/` to see currently available models. Future enhancement: dynamic model discovery from Scaleway API.

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
- Verify the model ID matches exactly (including quantization suffix like `:fp4`, `:bf16`, `:fp8`)
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
  baseUrl: "https://api.scaleway.com/v1",
  apiKey: config.apiKey,
  authHeader: true,
  api: "openai-completions", // default API for all models
  models: [...] // each model may override api via getApiForModel()
});
```

The provider registers with the default API (`openai-completions`). Individual model entries include a computed `api` field set by `getApiForModel()`. Models whose IDs appear in the exported `RESPONSE_API_MODELS` set (currently `openai/gpt-oss-120b:fp4`) receive `openai-responses` instead. See the **API Selection Behavior** section for details.

Benefits of this approach:
- Native Pi integration (`/model scaleway/...`)
- Leverages Pi's built-in streaming and error handling
- Minimal code (~50 lines)

### Model Management

Models are defined in `src/models.ts`:
- **Static defaults**: Curated list of stable, popular models
- **Future enhancement**: Dynamic discovery via `GET /v1/models` API
- **Fallback**: Always works offline with default models

See [MODEL_DISCOVERY_STRATEGY.md](./MODEL_DISCOVERY_STRATEGY.md) for design rationale.

## Future Enhancements

- [ ] Dynamic model discovery from `/v1/models` endpoint
- [ ] Model metadata caching with 24h refresh
- [ ] `/scaleway-refresh-models` command
- [ ] Token usage tracking
- [ ] Per-model cost configuration

## License

MIT
