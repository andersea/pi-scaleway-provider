import { describe, it, expect } from 'vitest';
import { DEFAULT_MODELS, getModels } from './models.js';

describe('model exclusions', () => {
  it('excludes non-chat models (whisper, embeddings)', () => {
    const modelIds = DEFAULT_MODELS.map(m => m.id);
    expect(modelIds).not.toContain('whisper-large-v3');
    expect(modelIds).not.toContain('qwen3-embedding-8b');
    expect(modelIds).not.toContain('bge-multilingual-gemma2');
  });

  it('excludes EOL for Serverless models', () => {
    const modelIds = DEFAULT_MODELS.map(m => m.id);
    expect(modelIds).not.toContain('llama-3.1-70b-instruct');
    expect(modelIds).not.toContain('llama-3.1-8b-instruct');
    expect(modelIds).not.toContain('mistral-small-3.1-24b-instruct-2503');
    expect(modelIds).not.toContain('mistral-nemo-instruct-2407');
    expect(modelIds).not.toContain('devstral-small-2505');
    expect(modelIds).not.toContain('sentence-t5-xxl');
    expect(modelIds).not.toContain('deepseek-r1-distill-llama-70b');
    expect(modelIds).not.toContain('qwen2.5-coder-32b-instruct');
  });

  it('excludes dedicated-only models', () => {
    const modelIds = DEFAULT_MODELS.map(m => m.id);
    expect(modelIds).not.toContain('gpt-oss-20b');
    expect(modelIds).not.toContain('qwen3.5-35b-a3b');
    expect(modelIds).not.toContain('qwen3.5-122b-a10b');
    expect(modelIds).not.toContain('gemma-4-31b-it');
    expect(modelIds).not.toContain('mistral-large-3-675b-instruct-2512');
    expect(modelIds).not.toContain('molmo-72b-0924');
  });
});

describe('gpt-oss-120b', () => {
  // EXCEPTION: despite Scaleway's docs stating gpt-oss-120b requires the
  // Responses API, we route it through openai-completions. The Responses
  // endpoint rejects the `include` field Pi sends for reasoning, returning
  // 400 "payload validation: 'include' is not supported". See the model
  // entry comment in models.ts and AGENTS.md for the full rationale.
  it('uses the default openai-completions API (no responses override)', () => {
    const model = DEFAULT_MODELS.find(m => m.id === 'gpt-oss-120b');
    expect(model?.api).toBeUndefined();
  });
});

describe('getModels', () => {
  it('returns a copy, not the original reference', () => {
    const models = getModels();
    expect(models).not.toBe(DEFAULT_MODELS);
  });

  it('returns the expected number of serverless models', () => {
    const models = getModels();
    expect(models.length).toBe(15);
  });
});