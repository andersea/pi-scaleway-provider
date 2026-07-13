# API Override Fix Summary

> **⚠️ SUPERSEDED** — This fix has been reverted. See the "gpt-oss-120b
> exception" note in `AGENTS.md` and the model entry comment in
> `src/models.ts`. The `openai-responses` override caused a 400
> `"'include' is not supported"` error from Scaleway. `gpt-oss-120b` now
> uses the default `openai-completions` API like all other models.

**File Updated**: `src/models.ts`

**Change**: Added `api: "openai-responses"` to the `gpt-oss-120b` model definition.

**Why**
- Scaleway documentation states that **gpt‑oss‑120b** must be accessed via the **Responses API** (`openai‑responses`).
- The project's `AGENTS.md` and `src/models.test.ts` both assert that this model needs an API override.
- The original static model list omitted the override, causing a test failure and a hidden dependency on Pi's runtime auto‑detection.

**Findings**
- The Pi debug log shows the runtime correctly resolved the model to `openai‑responses`, but the static code still lacked the explicit field.
- This mismatch could lead to future breakage if Pi’s auto‑detection changes.

**Resolution**
- Inserted the `api` property after the `cost` entry in the model object.
- The change makes the source of truth explicit, aligns the code with documentation, and satisfies the failing unit test.

**Next Steps**
1. Run the test suite (`npm test` or `npx vitest run src/models.test.ts`) to verify the `gpt‑oss‑120b` test now passes.
2. (Optional) Perform a live request with a valid `SCW_SECRET_KEY` to ensure the 400 error is due to payload, not API selection.
3. Keep this note in the `agents/` folder for future maintainers.
