import { describe, it, expect } from 'vitest';
import { DEFAULT_MODELS, getApiForModel, RESPONSE_API_MODELS, getModels } from './models';

describe('getApiForModel', () => {
  it('returns openai-responses for the OSS 120B model', () => {
    expect(getApiForModel('gpt-oss-120b')).toBe('openai-responses');
  });

  it('returns openai-completions for other models', () => {
    expect(getApiForModel('qwen3.6-35b-a3b')).toBe('openai-completions');
    expect(getApiForModel('mistral-small-3.2-24b-instruct-2506')).toBe('openai-completions');
    expect(getApiForModel('gemma-4-26b-a4b-it')).toBe('openai-completions');
    expect(getApiForModel('mistral-medium-3.5-128b')).toBe('openai-completions');
    expect(getApiForModel('llama-3.3-70b-instruct')).toBe('openai-completions');
    expect(getApiForModel('glm-5.2')).toBe('openai-completions');
    expect(getApiForModel('unknown-model')).toBe('openai-completions');
  });

  it('reflects the RESPONSE_API_MODELS set', () => {
    expect(RESPONSE_API_MODELS.has('gpt-oss-120b')).toBe(true);
    expect(RESPONSE_API_MODELS.size).toBe(1);
  });
});

describe('DEFAULT_MODELS static list', () => {
  it('contains all expected serverless chat models', () => {
    const modelIds = DEFAULT_MODELS.map(m => m.id);
    expect(modelIds).toContain('gpt-oss-120b');
    expect(modelIds).toContain('qwen3.6-35b-a3b');
    expect(modelIds).toContain('qwen3.5-397b-a17b');
    expect(modelIds).toContain('qwen3-235b-a22b-instruct-2507');
    expect(modelIds).toContain('qwen3-coder-30b-a3b-instruct');
    expect(modelIds).toContain('gemma-4-26b-a4b-it');
    expect(modelIds).toContain('gemma-3-27b-it');
    expect(modelIds).toContain('llama-3.3-70b-instruct');
    expect(modelIds).toContain('mistral-small-3.2-24b-instruct-2506');
    expect(modelIds).toContain('mistral-medium-3.5-128b');
    expect(modelIds).toContain('voxtral-small-24b-2507');
    expect(modelIds).toContain('devstral-2-123b-instruct-2512');
    expect(modelIds).toContain('pixtral-12b-2409');
    expect(modelIds).toContain('glm-5.2');
    expect(modelIds).toContain('holo2-30b-a3b');
  });

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

  it('assigns correct API type to gpt-oss-120b', () => {
    const model = DEFAULT_MODELS.find(m => m.id === 'gpt-oss-120b');
    expect(model?.api).toBe('openai-responses');
  });

  it('does not set api field on models that default to openai-completions', () => {
    const completionsModels = DEFAULT_MODELS.filter(m => m.id !== 'gpt-oss-120b');
    for (const model of completionsModels) {
      expect(model.api).toBeUndefined();
    }
  });

  it('sets correct context windows per Scaleway docs', () => {
    const getModel = (id: string) => DEFAULT_MODELS.find(m => m.id === id)!;

    expect(getModel('mistral-medium-3.5-128b').contextWindow).toBe(180_000);
    expect(getModel('gemma-3-27b-it').contextWindow).toBe(40_000);
    expect(getModel('pixtral-12b-2409').contextWindow).toBe(128_000);
    expect(getModel('holo2-30b-a3b').contextWindow).toBe(22_000);
    expect(getModel('gpt-oss-120b').contextWindow).toBe(128_000);
  });

  it('sets correct maxTokens per Scaleway docs', () => {
    const getModel = (id: string) => DEFAULT_MODELS.find(m => m.id === id)!;

    expect(getModel('pixtral-12b-2409').maxTokens).toBe(4_000);
    expect(getModel('gemma-3-27b-it').maxTokens).toBe(8_000);
    expect(getModel('gpt-oss-120b').maxTokens).toBe(32_000);
    expect(getModel('qwen3.5-397b-a17b').maxTokens).toBe(16_000);
  });

  it('sets reasoning flags per Scaleway docs', () => {
    const getModel = (id: string) => DEFAULT_MODELS.find(m => m.id === id)!;

    // Models with reasoning support
    expect(getModel('gpt-oss-120b').reasoning).toBe(true);
    expect(getModel('qwen3.6-35b-a3b').reasoning).toBe(true);
    expect(getModel('qwen3.5-397b-a17b').reasoning).toBe(true);
    expect(getModel('qwen3-235b-a22b-instruct-2507').reasoning).toBe(true);
    expect(getModel('gemma-4-26b-a4b-it').reasoning).toBe(true);
    expect(getModel('mistral-medium-3.5-128b').reasoning).toBe(true);
    expect(getModel('glm-5.2').reasoning).toBe(true);

    // Models without reasoning support
    expect(getModel('mistral-small-3.2-24b-instruct-2506').reasoning).toBe(false);
    expect(getModel('gemma-3-27b-it').reasoning).toBe(false);
    expect(getModel('llama-3.3-70b-instruct').reasoning).toBe(false);
    expect(getModel('pixtral-12b-2409').reasoning).toBe(false);
    expect(getModel('holo2-30b-a3b').reasoning).toBe(false);
  });

  it('has appropriate input modalities for each model', () => {
    const getModel = (id: string) => DEFAULT_MODELS.find(m => m.id === id)!;

    // Text-only models
    expect(getModel('gpt-oss-120b').input).toEqual(['text']);
    expect(getModel('qwen3-235b-a22b-instruct-2507').input).toEqual(['text']);
    expect(getModel('qwen3-coder-30b-a3b-instruct').input).toEqual(['text']);
    expect(getModel('llama-3.3-70b-instruct').input).toEqual(['text']);
    expect(getModel('devstral-2-123b-instruct-2512').input).toEqual(['text']);
    expect(getModel('glm-5.2').input).toEqual(['text']);

    // Vision models
    expect(getModel('qwen3.6-35b-a3b').input).toEqual(['text', 'image']);
    expect(getModel('qwen3.5-397b-a17b').input).toEqual(['text', 'image']);
    expect(getModel('gemma-4-26b-a4b-it').input).toEqual(['text', 'image']);
    expect(getModel('gemma-3-27b-it').input).toEqual(['text', 'image']);
    expect(getModel('mistral-small-3.2-24b-instruct-2506').input).toEqual(['text', 'image']);
    expect(getModel('mistral-medium-3.5-128b').input).toEqual(['text', 'image']);
    expect(getModel('pixtral-12b-2409').input).toEqual(['text', 'image']);
    expect(getModel('holo2-30b-a3b').input).toEqual(['text', 'image']);

    // Audio model
    expect(getModel('voxtral-small-24b-2507').input).toEqual(['text', 'audio']);
  });
});

describe('getModels', () => {
  it('returns DEFAULT_MODELS with API assignments applied', () => {
    const models = getModels();
    expect(models).toHaveLength(DEFAULT_MODELS.length);

    // Verify gpt-oss-120b has openai-responses
    const gptOss = models.find(m => m.id === 'gpt-oss-120b');
    expect(gptOss?.api).toBe('openai-responses');

    // Verify all other models have openai-completions
    const others = models.filter(m => m.id !== 'gpt-oss-120b');
    for (const model of others) {
      expect(model.api).toBe('openai-completions');
    }
  });

  it('does not mutate DEFAULT_MODELS', () => {
    const before = DEFAULT_MODELS.map(m => ({ ...m }));
    const models = getModels();
    expect(models).not.toBe(DEFAULT_MODELS); // different array reference
    // DEFAULT_MODELS should still have undefined api for non-gpt-oss models
    const nonApiModels = DEFAULT_MODELS.filter(m => m.id !== 'gpt-oss-120b');
    for (const model of nonApiModels) {
      expect(model.api).toBeUndefined();
    }
  });

  it('returns 15 serverless models', () => {
    const models = getModels();
    expect(models.length).toBe(15);
  });
});
