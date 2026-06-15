import { isAIProvider, type AIProvider } from "@/modules/shared";

export interface AIRequestConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export function parseAIRequestConfig(
  body: Record<string, unknown>,
): { ok: true; value: AIRequestConfig } | { ok: false; message: string } {
  const provider = typeof body.provider === "string" ? body.provider.trim() : "";
  const model = typeof body.model === "string" ? body.model.trim() : "";
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : "";

  if (!isAIProvider(provider)) {
    return { ok: false, message: "Select a valid AI provider." };
  }
  if (provider === "ollama" && !baseUrl) {
    return { ok: false, message: "Configure the local Ollama URL before this action." };
  }
  if (!model) {
    return {
      ok: false,
      message: provider === "ollama"
        ? "Configure the local Ollama model before this action."
        : "Select an AI model."
    };
  }
  if (provider !== "mock" && provider !== "ollama" && !apiKey) {
    return { ok: false, message: "Configure your AI provider API key." };
  }

  return {
    ok: true,
    value: {
      provider,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
      model,
    },
  };
}
