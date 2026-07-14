# Scaleway Generative AI Extension for Pi

A minimal Pi extension that registers Scaleway's Generative APIs as a native Pi provider.

## Installation

```bash
# Production — install via npm (recommended)
pi install npm:@andersea/pi-scaleway-gen

# Or install from git
pi install git:github.com/andersea/pi-scaleway-provider

# Development — load directly from source
pi -e ./extensions/index.ts
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

## Development

```bash
# Install dependencies
npm install

# Build (optional - jiti loads TS directly)
npm run build

# Lint
npm run lint

# Test with Pi
SCW_SECRET_KEY=scw_xxx pi -e ./extensions/index.ts
```

## Architecture

This extension uses Pi's **provider registration** pattern:

```typescript
pi.registerProvider("scaleway", {
  name: "Scaleway Generative AI",
  baseUrl: "https://api.scaleway.ai/v1",
  apiKey: "$SCW_SECRET_KEY",
  authHeader: true,
  api: "openai-completions",
  models: getModels()
});
```

All Scaleway models use the `openai-completions` API — including `gpt-oss-120b`, which the Scaleway docs suggest must use the Responses API. In practice, Scaleway's `/v1/responses` endpoint rejects the `include` field that Pi sends for reasoning models, so all models are routed through chat completions.

Models are defined in `extensions/models.ts` as a static, curated list sourced from [Scaleway's supported models page](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/).

Only serverless chat/generation models are included — non-chat models (audio, embeddings), EOL models, and dedicated-only models are excluded.

## License

MIT
