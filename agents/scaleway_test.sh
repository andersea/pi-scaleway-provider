#!/usr/bin/env bash
# ------------------------------------------------------------------
# Proof‑of‑Concept API tester for Scaleway Generative AI
#   • Tests all primary entry points:
#        GET /models
#        POST /chat/completions
#        POST /responses   (for models requiring responses API)
#   • Executes each endpoint twice – once in the default
#     namespace (no Project ID in the path) and once
#     including the Project ID
#   • Reports "SUCCESS" or "FAIL" per request
#   • Uses the SCW_SECRET_KEY and SCW_PROJECT_ID env vars
# ------------------------------------------------------------------

set -euo pipefail

# Helper: perform request & print result
request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  local url="${BASE_URL}${endpoint}"

  case "$method" in
    GET)
      http_output=$(curl -s --max-time 30 -w "=%{http_code}" \
        -H "Authorization: Bearer ${SCW_SECRET_KEY}" \
        "${url}")
      ;;
    POST)
      http_output=$(curl -s --max-time 30 -w "=%{http_code}" \
        -H "Authorization: Bearer ${SCW_SECRET_KEY}" \
        -H "Content-Type: application/json" \
        -d "${data}" "${url}")
      ;;
    *)
      echo "Unsupported method: $method"
      exit 1
      ;;
  esac

  local http_code=${http_output##*=}
  local body=${http_output%=$(printf "%s" "$http_code")}

  if (( http_code >= 200 && http_code < 300 )); then
    echo "${description} :: SUCCESS (status ${http_code})"
  else
    echo "${description} :: FAIL (status ${http_code})"
    echo "    Response body: ${body}"
  fi
}

# Validation
if [[ -z "${SCW_SECRET_KEY:-}" ]]; then
  echo "❌ SCW_SECRET_KEY env var is not set. Exiting."
  exit 1
fi

# Check for curl
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required"; exit 1; }

BASE_URL="https://api.scaleway.ai/v1"

# 1. List models (no project)
request GET "/models" "" "GET /models (default namespace)"

# 2. List models (with project) – skip if no project ID supplied
if [[ -n "${SCW_PROJECT_ID:-}" ]]; then
  request GET "/${SCW_PROJECT_ID}/models" "" "GET /models (project ${SCW_PROJECT_ID})"
fi

# 3. Chat completion – minimal payload (for models using chat completions API)
CHAT_PAYLOAD='{
  "model":"qwen/qwen3.6-35b-a3b:bf16",
  "messages":[{"role":"user","content":"Hello Scaleway!"}],
  "temperature":0.7
}'

request POST "/chat/completions" "${CHAT_PAYLOAD}" \
  "POST /chat/completions (default namespace)"

if [[ -n "${SCW_PROJECT_ID:-}" ]]; then
  request POST "/${SCW_PROJECT_ID}/chat/completions" "${CHAT_PAYLOAD}" \
    "POST /chat/completions (project ${SCW_PROJECT_ID})"
fi

# 4. Responses API test – for models requiring responses API (e.g., gpt-oss-120b)
RESPONSES_PAYLOAD='{
  "model":"openai/gpt-oss-120b:fp4",
  "input":"Hello Scaleway via Responses API!",
  "temperature":0.7
}'

request POST "/responses" "${RESPONSES_PAYLOAD}" \
  "POST /responses (default namespace)"

if [[ -n "${SCW_PROJECT_ID:-}" ]]; then
  request POST "/${SCW_PROJECT_ID}/responses" "${RESPONSES_PAYLOAD}" \
    "POST /responses (project ${SCW_PROJECT_ID})"
fi

# ------------------------------------------------------------------
# Done
# ------------------------------------------------------------------
echo "————————————————––––—"
echo "Scaleway Generative AI API test run completed."