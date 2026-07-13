# /v1/models response shape

The Scaleway /v1/models endpoint returns an OpenAI-style list response. The top-level payload contains a single list object with a data array of model entries.

**Documentation note:** This extension uses the `/v1/models` endpoint to discover models, then registers each model with Pi. By default, all models use the **chat completions** API (`openai-completions`). Models that appear in the `RESPONSE_API_MODELS` set (currently only `openai/gpt-oss-120b:fp4`) are routed to the **responses** API (`openai-responses`).

## Endpoint and authentication

- Full hostname: https://api.scaleway.ai
- Endpoint path: /v1/models
- Full request URL: https://api.scaleway.ai/v1/models
- Authentication: send a bearer token in the Authorization header using your Scaleway secret key.

Example:

```bash
curl -s \
  --url "https://api.scaleway.ai/v1/models" \
  --header "Authorization: Bearer ${SCW_SECRET_KEY}"
```

## Response format

- object: always "list" for the envelope
- data: an array of model objects
- each model entry contains:
  - id: the model identifier
  - object: always "model"
  - created: a Unix timestamp for when the model entry was created
  - owned_by: the provider or organization that owns the model

## Example response

```python
{'object': 'list',
 'data': [{'id': 'llama-3.3-70b-instruct',
   'object': 'model',
   'created': 1736258559,
   'owned_by': 'meta'},
  {'id': 'pixtral-12b-2409',
   'object': 'model',
   'created': 1730385501,
   'owned_by': 'mistral'},
  {'id': 'gemma-3-27b-it',
   'object': 'model',
   'created': 1730385501,
   'owned_by': 'google'},
  {'id': 'bge-multilingual-gemma2',
   'object': 'model',
   'created': 1730385501,
   'owned_by': 'baai'},
  {'id': 'qwen3-235b-a22b-instruct-2507',
   'object': 'model',
   'created': 1754049528,
   'owned_by': 'qwen'},
  {'id': 'mistral-small-3.2-24b-instruct-2506',
   'object': 'model',
   'created': 1755006551,
   'owned_by': 'mistral'},
  {'id': 'qwen3-coder-30b-a3b-instruct',
   'object': 'model',
   'created': 1755006551,
   'owned_by': 'qwen'},
  {'id': 'gpt-oss-120b',
   'object': 'model',
   'created': 1755093042,
   'owned_by': 'openai'},
  {'id': 'voxtral-small-24b-2507',
   'object': 'model',
   'created': 1757330049,
   'owned_by': 'mistral'},
  {'id': 'whisper-large-v3',
   'object': 'model',
   'created': 1722263169,
   'owned_by': 'openai'},
  {'id': 'qwen3-embedding-8b',
   'object': 'model',
   'created': 1755006551,
   'owned_by': 'qwen'},
  {'id': 'holo2-30b-a3b',
   'object': 'model',
   'created': 1755006551,
   'owned_by': 'hcompany'},
  {'id': 'devstral-2-123b-instruct-2512',
   'object': 'model',
   'created': 1766496679,
   'owned_by': 'mistral'},
  {'id': 'qwen3.5-397b-a17b',
   'object': 'model',
   'created': 1773394870,
   'owned_by': 'qwen'},
  {'id': 'gemma-4-26b-a4b-it',
   'object': 'model',
   'created': 1777469299,
   'owned_by': 'google'},
  {'id': 'qwen3.6-35b-a3b',
   'object': 'model',
   'created': 1778158991,
   'owned_by': 'qwen'},
  {'id': 'mistral-medium-3.5-128b',
   'object': 'model',
   'created': 1778158991,
   'owned_by': 'mistral'},
  {'id': 'glm-5.2',
   'object': 'model',
   'created': 1782376549,
   'owned_by': 'zai'}]}
```
