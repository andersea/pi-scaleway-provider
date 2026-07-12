# Model Discovery Strategy: Dynamic vs Static

## Research Findings

### Scaleway's Model Catalog Characteristics

1. **Large and Dynamic**: 50+ models with frequent additions/removals
2. **Complex Model IDs**: Format is `provider/model-name:quantization` (e.g., `openai/gpt-oss-120b:fp4`, `mistral/mistral-small-3.2-24b-instruct-2506:fp8`)
3. **EOL Models**: Many models marked as "EOL for Serverless" - availability changes over time
4. **Rich Metadata**: Each model has context window, max tokens, modalities, reasoning support, etc.
5. **API Available**: `GET /v1/models` endpoint returns current catalog

### Models API Response Format

```json
{
  "object": "list",
  "data": [
    {
      "id": "openai/gpt-oss-120b:fp4",
      "object": "model",
      "created": 1234567890,
      "owned_by": "openai"
    }
  ]
}
```

**Limitation**: The API returns minimal metadata (id, created, owned_by). Rich attributes (context window, max tokens, modalities) are only in documentation.

---

## Recommendation: **Hybrid Approach**

### Use dynamic discovery with smart caching and fallback defaults

**Rationale:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Static Only** | - Simple<br>- No runtime dependencies<br>- Predictable | - Becomes outdated<br>- Misses new models<br>- Includes EOL models<br>- Manual maintenance | ❌ Poor for production |
| **Dynamic Only** | - Always current<br>- No maintenance<br>- Discovers new models automatically | - Requires API call on startup<br>- Minimal metadata from API<br>- Fails if API unavailable<br>- No fallback | ⚠️ Risky |
| **Hybrid** | - Best of both<br>- Works offline<br>- Current when online<br>- Graceful degradation | - Slightly more complex<br>- Cache invalidation logic | ✅ **Recommended** |

---

## Implementation Strategy

### Phase 1: Static Defaults (Current MVP)
```typescript
const DEFAULT_MODELS: ProviderModelConfig[] = [
  {
    id: "openai/gpt-oss-120b:fp4",
    name: "GPT OSS 120B",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000
  },
  // ... 5-10 popular models
];
```

### Phase 2: Dynamic Discovery (Post-MVP)
```typescript
async function discoverModels(apiKey: string): Promise<ProviderModelConfig[]> {
  try {
    const response = await fetch('https://api.scaleway.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    
    // Map API response to ProviderModelConfig
    // Use DEFAULT_MODELS as fallback for missing metadata
    return data.data.map(apiModel => ({
      id: apiModel.id,
      name: apiModel.id.split('/').pop(),
      reasoning: false, // Default, override from cache
      input: ['text'],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128_000, // Default
      maxTokens: 32_000
    }));
  } catch (error) {
    console.warn('[Scaleway] Model discovery failed, using defaults');
    return DEFAULT_MODELS;
  }
}
```

### Phase 3: Smart Caching (Future)
- Cache discovered models to `~/.pi/scaleway-models-cache.json`
- Refresh cache every 24 hours or on startup (stale-while-revalidate)
- Merge cached metadata with live API response
- Allow manual cache refresh via `/scaleway-refresh-models` command

---

## Decision: Start with Static, Design for Dynamic

**For MVP**: Use a curated static list of 5-10 popular, stable models.

**Why:**
1. **Simplicity**: MVP should validate core functionality first
2. **Reliability**: No dependency on external API availability
3. **Speed**: Instant startup, no network calls
4. **Control**: Ensure models are tested and working

**But design the code to support dynamic discovery later:**
- Extract model list to separate module
- Don't hardcode model IDs throughout the codebase
- Document the discovery endpoint for future enhancement

---

## Recommended Static Model List (MVP)

Based on research, these are stable, popular models available in Serverless:

| Model ID | Name | Context | Max Tokens | Modalities | Reasoning |
|----------|------|---------|------------|------------|-----------|
| `openai/gpt-oss-120b:fp4` | GPT OSS 120B | 128k | 32k | Text | Yes |
| `qwen/qwen3.6-35b-a3b:bf16` | Qwen 3.6 35B | 256k | 32k | Text, Vision | Yes |
| `mistral/mistral-small-3.2-24b-instruct-2506:fp8` | Mistral Small 3.2 | 128k | 32k | Text, Vision | No |
| `google/gemma-4-26b-a4b-it:bf16` | Gemma 4 26B | 256k | 32k | Text, Vision | Yes |
| `mistral/mistral-medium-3.5-128b:fp8` | Mistral Medium 3.5 | 256k | 16k | Text, Vision | Yes |

**Avoid for MVP:**
- Models marked "EOL for Serverless"
- Dedicated-only models (require deployment)
- Very large models (397B+) - may have availability issues
- Audio/embedding models (different use case)

---

## Code Structure for Future-Proofing

```typescript
// src/models.ts
import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent/compat";

// Curated defaults - always available as fallback
export const DEFAULT_MODELS: ProviderModelConfig[] = [...];

// Discover models from API (future enhancement)
export async function discoverModels(apiKey: string): Promise<ProviderModelConfig[]> {
  // Implementation
}

// Get models: try discovery, fall back to defaults
export async function getModels(apiKey: string): Promise<ProviderModelConfig[]> {
  try {
    return await discoverModels(apiKey);
  } catch {
    return DEFAULT_MODELS;
  }
}
```

```typescript
// src/index.ts
import { getModels } from './models';

export default async function (pi: ExtensionAPI) {
  const config = loadConfig();
  if (!config) return;

  // For MVP: use defaults
  const models = DEFAULT_MODELS;
  
  // Future: const models = await getModels(config.apiKey);

  pi.registerProvider("scaleway", {
    name: "Scaleway Generative AI",
    baseUrl: API_BASE,
    apiKey: config.apiKey,
    authHeader: true,
    api: "openai-responses",
    models
  });
}
```

---

## Conclusion

**Start with static, design for dynamic.**

The hybrid approach provides the best long-term solution, but dynamic discovery adds complexity that's not needed for MVP validation. Implement with clean separation so dynamic discovery can be added as a post-MVP enhancement without refactoring.
