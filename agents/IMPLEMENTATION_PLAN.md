# Scaleway Generative AI Extension for Pi Agent

## Project Overview

Build a Pi Agent extension that provides seamless integration with Scaleway's Generative APIs by registering Scaleway as a native Pi provider, enabling users to invoke Scaleway-hosted LLMs via `/model scaleway/<model-id>`.

---

## Goals & Requirements

### Core Functionality (MVP)
- [x] Register Scaleway as a Pi provider via `pi.registerProvider()`
- [x] Support Scaleway OpenAI-compatible API (`/v1` endpoints)
- [x] Handle authentication via API key (environment variable)
- [x] Define supported models with proper `ProviderModelConfig` schema
- [x] Provide UI status widget showing connection state

### Configuration
- [x] Read API key from `SCW_SECRET_KEY` or `SCALWAY_API_KEY` environment variable
- [ ] Optional: Persist API key locally (per-project or global)
- [ ] Optional: Allow configuration of default model

### User Experience
- [x] Status widget in footer (green indicator when ready)
- [ ] Clear error messages for auth failures, rate limits, model errors
- [x] Model selection via `/model scaleway/<model-id>`

### Distribution
- [ ] Package as npm module with `pi` extension manifest
- [ ] Include TypeScript types
- [ ] Provide README with installation/usage instructions

---

## Architecture

```
pi-scaleway-provider/
├── package.json              # npm package with pi extension manifest
├── tsconfig.json             # TypeScript config
├── src/
│   └── index.ts              # Main extension entry point (provider registration)
├── README.md
└── IMPLEMENTATION_PLAN.md
```

**Design Decision**: Use provider-based approach (not tool-based) because:
- More idiomatic for Pi extensions
- Cleaner UX (`/model scaleway/...` vs tool calls)
- Lower complexity (no tool schema, execute handler, streaming logic)
- Leverages Pi's built-in provider infrastructure

---

## Implementation Status

### ✅ Phase 1: Minimal MVP (Complete)
- [x] Initialize npm package with proper `pi` manifest
- [x] Set up TypeScript with strict mode
- [x] Provider registration with correct signature
- [x] Environment variable configuration (SCW_SECRET_KEY)
- [x] Model definitions with required fields
- [x] Status widget
- [x] ESLint configuration
- [x] .gitignore for build artifacts
- [x] Verified model IDs from Scaleway documentation
- [x] Models extracted to separate module for future dynamic discovery

### 🔄 Phase 2: Polish & Testing (Next)
- [ ] Test with actual Scaleway API
- [ ] Error handling for 401/429/5xx responses
- [ ] Integration test: `pi -e ./src/index.ts`

### 📋 Phase 3: Documentation & Release
- [ ] Document troubleshooting steps
- [ ] Test `pi install` workflow
- [ ] Publish to npm (optional)

### 🔮 Phase 4: Future Enhancements
- [ ] Dynamic model discovery from `/v1/models` endpoint
- [ ] Model metadata caching with 24h refresh
- [ ] `/scaleway-refresh-models` command
- [ ] Token usage tracking

---

## Technical Details

### Scaleway API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Base URL | `https://api.scaleway.com/v1` | - |
| Chat Completions | `/models/{modelId}/chat/completions` | POST |
| List Models | `/models` | GET |

### Authentication
```
Authorization: Bearer <SCW_SECRET_KEY>
```

### Provider Configuration

```typescript
pi.registerProvider("scaleway", {
  name: "Scaleway Generative AI",
  baseUrl: "https://api.scaleway.com/v1",
  apiKey: config.apiKey,
  authHeader: true,
  api: "openai-responses",  // OpenAI-compatible API
  models: [...]
});
```

### Model Configuration Schema

```typescript
{
  id: "llama-3.1-70b-instruct",  // Model ID (no provider prefix)
  name: "Llama 3.1 70B Instruct",  // Display name
  reasoning: false,  // Required: whether model supports reasoning
  input: ["text"],  // Supported input types
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },  // Per-million rates
  contextWindow: 128_000,  // Context window size
  maxTokens: 32_000  // Max output tokens
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SCW_SECRET_KEY` | Yes | Scaleway API key |
| `SCALWAY_API_KEY` | Yes (alt) | Alternative env var name |

### Getting Your API Key

1. Log in to [Scaleway Console](https://console.scaleway.com)
2. Go to **Credentials** → **API Keys**
3. Create or copy an existing API key
4. Export it:
   ```bash
   export SCW_SECRET_KEY="scw_..."
   ```

---

## Error Handling Strategy

| Error Type | Detection | User Feedback |
|------------|-----------|---------------|
| Missing API key | Config check | Console error on load, status widget not shown |
| Invalid API key | 401 response | Pi will show auth error from provider |
| Rate limited | 429 response | Pi will show rate limit error |
| Model not found | 404 response | Pi will show model error |

**Note**: Pi's provider infrastructure handles most error cases automatically. Custom error handling can be added later if needed.

---

## Future Enhancements (Post-MVP)

- [ ] Model auto-discovery on startup (fetch from `/models` endpoint)
- [ ] Config file persistence (`~/.pi/scaleway-config.json`)
- [ ] `/scaleway-models` command to list available models
- [ ] Per-session model override
- [ ] Token usage tracking
- [ ] Support for multimodal models (image input)

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@earendil-works/pi-coding-agent` | Extension types (peer dependency) |

**Dev Dependencies:**
- `typescript`
- `@types/node`

---

## Testing Strategy

### Manual Integration Tests
```bash
# 1. Test without config (should log error, not register provider)
pi -e ./src/index.ts

# 2. Test with env var
SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts -p "Use scaleway provider to say hello"

# 3. Test model selection
SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts
/model scaleway/llama-3.1-70b-instruct "Write a haiku about coding"
```

### Verification Checklist
- [ ] Extension loads without errors
- [ ] Provider appears in provider list
- [ ] Models are selectable via `/model`
- [ ] Can generate text via Scaleway API
- [ ] Errors are user-friendly

---

## Definition of Done (MVP)

- [x] Extension loads without errors
- [x] Provider registers with correct signature
- [x] Models defined with all required fields
- [x] Status widget shows when ready
- [ ] Verified working with actual Scaleway API
- [ ] README documents install + usage

---

## Timeline Estimate

| Phase | Effort | Status |
|-------|--------|--------|
| 1. Minimal MVP | 1-2 hrs | ✅ Complete |
| 2. Testing & Verification | 1-2 hrs | 🔄 Next |
| 3. Documentation & Release | 1 hr | 📋 Planned |
| **Total** | **~3-5 hrs** | |

---

## Known Issues / TODOs

1. **No dynamic model discovery yet** - Models are hardcoded in `src/models.ts`. Future enhancement: fetch from `/v1/models` endpoint on startup with caching. See [MODEL_DISCOVERY_STRATEGY.md](./MODEL_DISCOVERY_STRATEGY.md).

2. **No error handling yet** - Provider relies on Pi's default error handling. May need custom handling for better UX.

3. **Model quantization suffixes** - Model IDs include quantization (`:fp4`, `:bf16`, `:fp8`). Users must include these exactly.

---

## Next Steps

1. **Test with actual Scaleway API** - Verify model IDs and API compatibility
2. **Update model list** - Replace placeholder IDs with verified models
3. **Test end-to-end** - Run `pi -e ./src/index.ts` with valid API key
4. **Document verified models** - Update README with working model IDs
