# Future Authentication Architecture Plan

## Overview
Proposed secure authentication and credential storage design for Pi provider extensions, focusing on Scaleway integration.

## Key Components

### 1. Vault-Based Credential Storage
- Integrate `@victor-software-house/pi-credential-vault` for encrypted credential management.
- Store API keys (e.g., `SCW_SECRET_KEY`) in vault backends (`age`, `keychain`, `passthrough`).
- Replace plaintext config with dynamic vault fetching (`!get-from-vault` syntax).

**Security Benefits**
- No plaintext secrets in code/config files
- Interactive vault commands (`pi vault get scaleway_api_key`)
- Audit logs for credential access

### 2. OAuth-First Authentication
- Use `pi.registerProvider()`'s `oauth` field for standardized flows
- Implement PKCE with `/login` support
- Auto-refresh tokens on rate limits/expiry

**Implementation Tools**
- `pi-multi-auth` for multi-provider OAuth management
- `ilikolach/pi-mcp-extension` for template flows

### 3. Credential Rotation & Lifecycle Management
- Monitor rate limits via `/scaleway-status`
- Auto-rotate keys with backup accounts
- Store rotated credentials in vault

### 4. Security Hardening
- Enable `pi-sensitive-guard` to block credential writes/reads
- Use `badlogic/pi-mono` restrictions to prevent context leakage
- Block writes to `.env` and sensitive files

## Implementation Steps
1. Integrate vault backend with Scaleway provider
2. Add OAuth login flow
3. Implement auto-rotation command
4. Add security guard integrations

## Risks & Mitigations
- **Encryption gaps**: Use AES-256 vault encryption
- **Weak keys**: Generate 256-bit entropy tokens
- **Integration issues**: Test with Pi async flow
- **Redundant code**: Remove manual env var loading (Pi handles natively)

Files to create:
- `agents/auth_architecture_plan.md`
- Update `src/index.ts` to use vault credentials
- Add `/login` command flow

## Simplification: Pi-Native Env Var Interpolation
Pi's `registerProvider()` natively resolves `$ENV_VAR` syntax in `apiKey`. No separate credential loading function needed. Example patterns from official extensions:

\`\`\`typescript
// Direct interpolation (Pi handles resolution)
apiKey: "$SCW_SECRET_KEY"
\`\`\`

This eliminates boilerplate `loadConfig()` functions and provides consistent error messaging when variables are missing.