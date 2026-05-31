import { describe, expect, it } from "vitest";
import { parseAIRequestConfig } from "./ai-request";

describe("parseAIRequestConfig", () => {
  it("requires an Ollama base URL", () => {
    const parsed = parseAIRequestConfig({
      provider: "ollama",
      model: "llama3.2",
    });

    expect(parsed).toEqual({
      ok: false,
      message: "Configura la URL local de Ollama antes de realizar esta acción.",
    });
  });

  it("requires an Ollama model even when the base URL is configured", () => {
    const parsed = parseAIRequestConfig({
      provider: "ollama",
      baseUrl: "http://localhost:11434",
    });

    expect(parsed).toEqual({
      ok: false,
      message: "Configura el modelo local de Ollama antes de realizar esta acción.",
    });
  });
});
