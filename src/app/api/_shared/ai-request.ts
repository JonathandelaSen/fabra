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
    return { ok: false, message: "Selecciona un proveedor de IA válido." };
  }
  if (provider === "ollama" && !baseUrl) {
    return { ok: false, message: "Configura la URL local de Ollama antes de realizar esta acción." };
  }
  if (!model) {
    return {
      ok: false,
      message: provider === "ollama"
        ? "Configura el modelo local de Ollama antes de realizar esta acción."
        : "Selecciona un modelo de IA."
    };
  }
  if (provider !== "mock" && provider !== "ollama" && !apiKey) {
    return { ok: false, message: "Configura tu API key del proveedor de IA." };
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
