# Plan: Convert pi-scaleway-gen-extension to a Pi Installable Package

> **Date**: 2026-07-13  
> **Purpose**: Step-by-step implementation plan to make `pi-scaleway-gen-extension` publishable and installable via `pi install npm:pi-scaleway-gen`

---

## Background

The extension currently loads and works via `pi -e ./src/index.ts`, but cannot be installed from npm because:

- The `pi` manifest points to `./dist/index.js` (compiled output)
- `dist/` is in `.gitignore` (won't be committed)
- No `files` field in `package.json` (npm would publish nothing)
- Missing `"pi-package"` keyword (gallery discoverability)
- Uses CommonJS-style `main` pointing to `dist/` instead of `.ts` source

Published pi extensions (`pi-agent-goal`, `pi-lsp-extension`) ship **TypeScript source directly** — pi loads `.ts` via `jiti` at runtime, so no compiled output is needed on npm.

**Evidence** — `pi-agent-goal@2026.6.14`:
```json
{
  "main": "./extensions/index.ts",
  "pi": { "extensions": ["./extensions/index.ts"] },
  "files": ["extensions", "src", "README.md", "docs", "LICENSE"]
}
```

**Evidence** — `pi-lsp-extension@1.0.0`:
```json
{
  "pi": { "extensions": ["./src/index.ts"] },
  "files": ["src"]
}
```

---

## Implementation Steps

### Step 1: Rewrite `package.json`

This is the most critical change. Replace the entire file with the corrected version.

**Changes**:
- `"type": "module"` — ESM (required by all published extensions)
- `"main": "./src/index.ts"` — Point to `.ts` source, not `dist/`
- Add `"exports"` field for modern ESM package resolution
- Add `"pi-package"` to keywords
- Add `"pi"` prefix to keywords
- Add `"files"` field with `["src", "README.md", "LICENSE"]`
- Add `"publishConfig": { "access": "public" }`
- Add `"typebox": "*"` to peerDependencies
- Remove `"types": "dist/index.d.ts"` (no longer needed)
- Fix `repository.url` to match intended package identity

### Step 2: Clean up `dist/` from git tracking

Since `dist/` is in `.gitignore`, it shouldn't be tracked. Verify:
```bash
git ls-files --cached dist/
```
If any files appear, remove them:
```bash
git rm -r --cached dist/
git commit -m "chore: remove dist/ from git tracking"
```

### Step 3: Verify `tsconfig.json` is correct

Current config is fine — `rootDir: "./src"` and `include: ["src/**/*"]` match the new `files` array.

**No changes needed.**

### Step 4: Update `.gitignore`

**No changes needed.** `dist/` should stay ignored — it's not shipped on npm.

### Step 5: Verify build still works

```bash
npm run build
```

The build is for **IDE/editor convenience only** — it produces `dist/` but that directory is never published. Keeping the build step helps developers with type checking and autocomplete.

### Step 6: Test with `pi -e`

```bash
SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts
```

Should load the extension and register the Scaleway provider, just as before.

### Step 7: Dry-run npm publish

```bash
npm pack --dry-run
```

Verify the output includes `src/index.ts`, `src/models.ts`, `src/models.test.ts`, `src/types.d.ts`, `README.md`, `LICENSE` — and does **not** include `dist/`, `node_modules/`, `.pi-subagents/`, or test artifacts.

### Step 8: Update `README.md`

Adjust installation examples:
- Keep `pi -e ./src/index.ts` for development
- Add `pi install npm:pi-scaleway-gen` for production install
- Clarify that no `npm run build` step is needed to install from npm
- Update any broken repo URLs

### Step 9: Update `CONTRIBUTING.md`

Update development instructions:
- Clarify that `npm run build` is optional (for IDE only)
- Remove any mention of `dist/` being required for testing

### Step 10: Update `AGENTS.md`

Update the "Development Workflow" section to reflect the corrected package layout.

### Step 11: Final verification checklist

- [ ] `npm run build` succeeds
- [ ] `SCW_SECRET_KEY=scw_xxx pi -e ./src/index.ts` loads without errors
- [ ] `npm pack --dry-run` outputs correct files
- [ ] Provider registers correctly in pi
- [ ] `/model scaleway/` lists models
- [ ] Model selection and chat works end-to-end

---

## Files to Modify

| File | Action |
|------|--------|
| `package.json` | **Rewrite** — full replacement with corrected manifest |
| `README.md` | Update install instructions |
| `CONTRIBUTING.md` | Update build/dev instructions |
| `AGENTS.md` | Update development workflow section |
| `.gitignore` | No changes |
| `tsconfig.json` | No changes |
| `src/index.ts` | No changes |
| `src/models.ts` | No changes |
| `dist/` | Remove from git tracking (Step 2) |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `pi -e ./src/index.ts` breaks after changes | Low | Only `package.json` changes affect this path; jiti loads `.ts` directly |
| `npm pack` excludes required files | Low | Dry-run verification (Step 7) catches this |
| Missing `typebox` peer dep causes issues at runtime | Very low | `typebox` is bundled by pi; peer dep `"*"` is standard |
| ESM `"type": "module"` breaks jiti loading | None | All published extensions use ESM; jiti handles it |

---

## Rollback Plan

If anything breaks:
1. Revert `package.json` to the original — the extension still works with `pi -e`
2. `dist/` build artifacts are still available if needed
3. The only loss would be the ability to publish to npm — not functional capability

---

## Estimated Effort

| Step | Effort |
|------|--------|
| Step 1: Rewrite package.json | 5 min |
| Step 2: Clean git tracking | 2 min |
| Step 3: Verify tsconfig | 1 min |
| Step 4: Verify .gitignore | 1 min |
| Step 5: Build test | 2 min |
| Step 6: pi -e test | 3 min |
| Step 7: npm pack dry-run | 2 min |
| Step 8: Update README | 5 min |
| Step 9: Update CONTRIBUTING | 2 min |
| Step 10: Update AGENTS | 2 min |
| Step 11: Final checklist | 5 min |
| **Total** | **~30 min** |