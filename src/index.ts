/**
 * Scaleway Generative AI Provider Extension for Pi
 * 
 * Minimal implementation registering Scaleway as a native Pi provider
 * 
 * Environment variables:
 * - SCW_SECRET_KEY: Scaleway API key (required)
 * 
 * Usage:
 *   pi -e ./src/index.ts
 *   /model scaleway/openai/gpt-oss-120b:fp4 "Test query"
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent/compat";
import { getModels } from "./models";

// Configuration constants
// Use the full /v1 base so Pi's provider paths resolve to Scaleway's v1 endpoints.
const API_BASE = "https://api.scaleway.ai/v1";

// Configuration loader
function loadConfig() {
  // SCW_SECRET_KEY is the official Scaleway convention
  const apiKey = process.env.SCW_SECRET_KEY;
  
  if (!apiKey) {
    console.error("[Scaleway] Missing API key. Set SCW_SECRET_KEY environment variable.");
    return null;
  }

  return { apiKey };
}

// Provider registration
export default async function (pi: ExtensionAPI) {
  const config = loadConfig();
  if (!config) return;

  const models = getModels();

  // Register provider with static model list

  pi.registerProvider("scaleway", {
    name: "Scaleway Generative AI",
    baseUrl: API_BASE,
    apiKey: config.apiKey,
    authHeader: true,
    api: "openai-completions",
    models
  });

  // Status widget
  pi.ui?.addStatus?.({
    id: "scaleway-status",
    text: "Scaleway: ✅ Ready",
    tooltip: "Scaleway Generative APIs provider"
  });

  // Normal exit after registration
}