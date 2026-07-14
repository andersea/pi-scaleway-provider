/**
 * Scaleway Generative AI Provider Extension for Pi
 * 
 * Minimal implementation registering Scaleway as a native Pi provider
 * 
 * Environment variables:
 * - SCW_SECRET_KEY: Scaleway API key (required)
 * 
 * Usage:
 *   pi -e ./dist/index.js
 *   pi -e ./dist/index.js --model scaleway/gpt-oss-120b -p "Test query"
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent/compat";
import { getModels } from "./models.js";

// Configuration constants
// Use the full /v1 base so Pi's provider paths resolve to Scaleway's v1 endpoints.
const API_BASE = "https://api.scaleway.ai/v1";

// Provider registration
export default async function (pi: ExtensionAPI) {
  const models = getModels();

  // Register provider with static model list
  // Pi automatically resolves $SCW_SECRET_KEY from environment
  pi.registerProvider("scaleway", {
    name: "Scaleway Generative AI",
    baseUrl: API_BASE,
    apiKey: "$SCW_SECRET_KEY",
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