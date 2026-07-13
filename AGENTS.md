# Scaleway Generative AI Extension — Implementation Documentation

This document follows the **Diataxis framework** for technical documentation, providing:
- **Reference** — complete technical specifications
- **How-to guides** — implementation patterns and workflows
- **Explanation** — architectural decisions and design rationale

For user-facing usage documentation, see [README.md](README.md).

---

## 1. Provider Integration (Reference)

### 1.1 Registration Pattern
The extension registers a provider using Pi's native provider registration API:

```typescript
pi.registerProvider("scaleway", {
  name: "Scaleway Generative AI",
  baseUrl: "https://api.scaleway.com/v1",
  apiKey: config.apiKey,
  authHeader: true,
  api: "openai-completions",        // default API for all models
  models: [...]                      // each model may override api via getApiForModel()
});
```

**Key properties:**
| Property | Purpose |
|----------|---------|
| `name` | Human-readable provider identity |
| `baseUrl` | Scaleway Generative API endpoint |
| `apiKey` | Retrieved from `SCW_SECRET_KEY` env var |
| `authHeader` | Uses `Authorization: Bearer <key>` |
| `api` | Default API type (`openai-completions`) |

### 1.2 Model Selection Logic
Models are defined in `src/models.ts` as an array of model descriptors. Each entry includes:
- `id` — Full model identifier (e.g., `openai/gpt-oss-120b:fp4`)
- `name` — Display name
- `api` — Computed via `getApiForModel(id)` (see §5)

### 1.3 API Fallback Strategy
The provider uses a **per-model API selection** mechanism rather than a global fallback:
- Default: `openai-completions` (covers ~95% of models)
- Override: `openai-responses` for models in `RESPONSE_API_MODELS` set
- No runtime fallback — selection is deterministic at registration time

---

## 2. Models Management (Reference + How-to)

### 2.1 Model Definition Structure
```typescript
interface ScalewayModel {
  id: string;           // e.g., "openai/gpt-oss-120b:fp4"
  name: string;         // e.g., "GPT OSS 120B (FP4)"
  api: "openai-completions" | "openai-responses";  // assigned by getApiForModel()
}
```

### 2.2 Quantization Support
Models include quantization suffixes as part of their ID:
- `:fp4` — 4-bit floating point
- `:bf16` — bfloat16
- `:fp8` — 8-bit floating point

**Rationale:** Quantization is part of the model identity on Scaleway's platform; users must specify the exact variant.

### 2.3 Static vs Dynamic Discovery
| Approach | Status | Description |
|----------|--------|-------------|
| **Static defaults** | ✅ Implemented | Curated list in `src/models.ts` — works offline |
| **Dynamic discovery** | 🔮 Planned | Fetch from `GET /v1/models` endpoint |
| **Cache + refresh** | 🔮 Planned | 24h TTL with `/scaleway-refresh-models` command |

**Decision rationale:** Static list ensures zero-latency startup and offline operation. Dynamic discovery adds resilience for new model releases but introduces network dependency and caching complexity.

---

## 3. Architecture Details (Explanation)

### 3.1 Component Responsibilities
```
src/
├── index.ts          # Provider registration, config validation, exports
├── models.ts         # Model definitions, API selection logic, exports
├── models.test.ts    # Unit tests for model selection
├── types.d.ts        # TypeScript declarations for Pi integration
└── models.md         # Generated model reference table
```

### 3.2 Error Handling Flow
```
1. Config validation (missing SCW_SECRET_KEY) → Early exit with clear message
2. API request → Pi's built-in error handling (retry, streaming errors)
3. 401/403 → Surface as authentication errors to user
4. 404 (model not found) → Suggest `/model scaleway/` to list available
5. 429 → Surface rate limit with retry guidance
```

### 3.3 Streaming Implementation
Delegated entirely to Pi's provider abstraction:
- Provider registers with `api: "openai-completions"` or `"openai-responses"`
- Pi handles SSE parsing, chunk transformation, and UI rendering
- No custom streaming code in this extension

---

## 4. Technical Enhancements (Reference)

### 4.1 Planned Model Discovery System
```typescript
// Future: src/discovery.ts
async function fetchModels(): Promise<ScalewayModel[]> {
  const response = await fetch("https://api.scaleway.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  return transformScalewayModels(await response.json());
}
```

### 4.2 Caching Strategy
- **Storage:** In-memory with optional file-backed persistence (`~/.pi/cache/scaleway-models.json`)
- **TTL:** 24 hours
- **Invalidation:** Manual via `/scaleway-refresh-models` or automatic on version bump

### 4.3 Cost Tracking Proposals
| Feature | Description |
|---------|-------------|
| Per-model pricing | Map model ID → $/1M tokens (input/output) |
| Usage accumulation | Track tokens per session, per project |
| Cost estimation | Pre-flight estimate for long prompts |

---

## 5. API Selection Mechanism (Reference + Explanation)

### 5.1 Default API Usage
```typescript
const DEFAULT_API = "openai-completions";
```

All models use this unless explicitly overridden.

### 5.2 Responses API Trigger Conditions
```typescript
const RESPONSE_API_MODELS = new Set([
  "openai/gpt-oss-120b:fp4"  // Only model currently requiring responses API
]);
```

**Why this model?** GPT-OSS-120B on Scaleway exposes the OpenAI Responses API interface rather than Chat Completions.

### 5.3 Model-Specific Routing
```typescript
function getApiForModel(modelId: string): "openai-completions" | "openai-responses" {
  return RESPONSE_API_MODELS.has(modelId) ? "openai-responses" : "openai-completions";
}
```

**Design decision:** Centralized set makes it trivial to add/remove models. No per-model configuration files needed.

---

## 6. Development Workflow (How-to)

### 6.1 Dependency Management
```bash
# Install
npm install

# Update dependencies
npm update

# Audit
npm audit
```

### 6.2 Testing Strategy
```bash
# Unit tests (model selection logic)
npm test

# Integration test with Pi (requires SCW_SECRET_KEY)
SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts
```

### 6.3 Build Process
```bash
# Type-check only (no emit)
npm run typecheck

# Full build (outputs to dist/)
npm run build

# Lint
npm run lint
```

**Note:** Pi loads TypeScript directly via `jiti` — `npm run build` is optional for development but required for npm publishing.

---

## 7. Future Roadmap (Explanation)

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| High | Dynamic model discovery | Medium | Scaleway API stability |
| High | Model metadata caching | Low | Local filesystem access |
| Medium | `/scaleway-refresh-models` command | Low | Pi command registration |
| Medium | Token usage tracking | Medium | Pi's usage hooks |
| Low | Per-model cost configuration | Low | Pricing data source |

---

## 8. Documentation Standards (Meta)

This document follows these principles (derived from Chromium, AWS, and Diataxis guidelines):

1. **Document only what exists** — No speculative features
2. **Favor current & accurate** over comprehensive but stale
3. **Single source of truth** — Link to code rather than duplicating
4. **Purpose-specific sections** — Reference vs How-to vs Explanation clearly separated
5. **Smart specs for agents** — Business purpose, operational boundaries, integration points, decision logic
6. **Derived from reality** — Code structure, interfaces, and tests inform documentation

### 8.1 Update Protocol
- Update AGENTS.md when changing provider registration, model list, or API selection logic
- Keep README.md user-focused; AGENTS.md implementation-focused
- Run `npm run build` to regenerate `models.md` from `models.ts`

### 8.2 Cross-References
- [README.md](README.md) — Installation, usage, troubleshooting
- [MODEL_DISCOVERY_STRATEGY.md](MODEL_DISCOVERY_STRATEGY.md) — Design rationale for model discovery
- `src/models.ts` — Source of truth for model definitions
- `src/index.ts` — Source of truth for provider registration

---

## 9. Sources & References

| Topic | Source |
|-------|--------|
| AI Agent Specifications | [Addy Osmani: How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) |
| AWS Agentic AI Lens | [AGENTSUS03-BP03](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html) |
| Chromium Documentation Guidelines | [documentation_guidelines.md](https://chromium.googlesource.com/chromium/src/+show/HEAD/docs/documentation_guidelines.md) |
| Pi Extensions Documentation | [Pi Extensions Docs](https://pi.dev/docs/latest/extensions) |
| Diataxis Framework | [Diataxis](https://diataxis.fr/) |
| Documentation as Code | [Sourcegraph Guide](https://sourcegraph.com/blog/documentation-as-code) |
| OpenAI Agent Definitions | [OpenAI API Docs](https://developers.openai.com/api/docs/guides/agents/define-agents) |