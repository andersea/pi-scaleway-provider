import { describe, it, expect, vi, afterEach } from 'vitest';
import { discoverModels, DEFAULT_MODELS, getApiForModel, RESPONSE_API_MODELS } from './models';

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
    expect(getApiForModel('unknown-model')).toBe('openai-completions');
  });

  it('reflects the RESPONSE_API_MODELS set', () => {
    // Ensure the set contains the expected model
    expect(RESPONSE_API_MODELS.has('gpt-oss-120b')).toBe(true);
    expect(RESPONSE_API_MODELS.size).toBe(1);
  });
});

describe('discoverModels', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns models from successful API response', async () => {
    const mockResponse = {
      object: 'list',
      data: [
        { id: 'llama-3.3-70b-instruct', object: 'model', created: 1736258559, owned_by: 'meta' },
        { id: 'pixtral-12b-2409', object: 'model', created: 1730385501, owned_by: 'mistral' },
        { id: 'gpt-oss-120b', object: 'model', created: 1755093042, owned_by: 'openai' }
      ]
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });
    global.fetch = mockFetch;

    const result = await discoverModels('test-api-key');

    // Expect three models, each transformed to ProviderModelConfig
    expect(result).toHaveLength(3);
    // Check first model (llama-3.3-70b-instruct) - should use completions API
    expect(result[0].id).toBe('llama-3.3-70b-instruct');
    expect(result[0].name).toBe('llama-3.3-70b-instruct');
    expect(result[0].reasoning).toBe(true);
    expect(result[0].input).toEqual(['text', 'image']);
    expect(result[0].api).toBe('openai-completions');
    // Check second model (pixtral-12b-2409) - should use completions API
    expect(result[1].id).toBe('pixtral-12b-2409');
    expect(result[1].name).toBe('pixtral-12b-2409');
    expect(result[1].api).toBe('openai-completions');
    // Check third model (gpt-oss-120b) - should use responses API
    expect(result[2].id).toBe('gpt-oss-120b');
    expect(result[2].name).toBe('gpt-oss-120b');
    expect(result[2].api).toBe('openai-responses');
  });

  it('returns DEFAULT_MODELS on fetch rejection', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const result = await discoverModels('test-api-key');

    expect(result).toEqual(DEFAULT_MODELS);
  });

  it('returns DEFAULT_MODELS on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    });
    global.fetch = mockFetch;

    const result = await discoverModels('test-api-key');

    expect(result).toEqual(DEFAULT_MODELS);
  });

  it('returns DEFAULT_MODELS when API returns empty data', async () => {
    const mockResponse = {
      object: 'list',
      data: []
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });
    global.fetch = mockFetch;

    const result = await discoverModels('test-api-key');

    expect(result).toEqual(DEFAULT_MODELS);
  });

  it('returns DEFAULT_MODELS when API returns invalid shape', async () => {
    const mockResponse = {
      object: 'invalid',
      data: 'not-an-array'
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });
    global.fetch = mockFetch;

    const result = await discoverModels('test-api-key');

    expect(result).toEqual(DEFAULT_MODELS);
  });
});