import { describe, it, expect, vi, afterEach } from 'vitest';
import { discoverModels, DEFAULT_MODELS } from './models';

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
    // Check first model (llama-3.3-70b-instruct)
    expect(result[0].id).toBe('meta/llama-3.3-70b-instruct:fp4');
    expect(result[0].name).toBe('meta/llama-3.3-70b-instruct');
    expect(result[0].reasoning).toBe(true);
    expect(result[0].input).toEqual(['text', 'image']);
    // Check second model (pixtral-12b-2409)
    expect(result[1].id).toBe('mistral/pixtral-12b-2409:fp4');
    expect(result[1].name).toBe('mistral/pixtral-12b-2409');
    // Check third model (gpt-oss-120b)
    expect(result[2].id).toBe('openai/gpt-oss-120b:fp4');
    expect(result[2].name).toBe('openai/gpt-oss-120b');
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