import { describe, expect, it, vi } from "vitest";
import { OllamaJobMatchScoringAIServiceFactory } from "./ollama-job-match-scoring-ai.service";
import { OllamaJobMatchScoringParseError } from "../../domain/errors/ollama-job-match-scoring-parse.error";
import { NoOpTelemetry } from "@/backend/modules/shared";

const mockGenerate = vi.fn();

vi.mock("ollama", () => {
  return {
    Ollama: class {
      generate = mockGenerate;
    },
  };
});

describe("OllamaJobMatchScoringAIService", () => {
  it("throws OllamaJobMatchScoringParseError when Ollama returns invalid JSON", async () => {
    mockGenerate.mockResolvedValue({
      response: "invalid-json",
    });

    const telemetry = new NoOpTelemetry();
    const spyLog = vi.spyOn(telemetry, "log");
    const spyCapture = vi.spyOn(telemetry, "captureException");

    const factory = new OllamaJobMatchScoringAIServiceFactory(telemetry);
    const service = factory.create({ model: "test-model" });

    await expect(
      service.score({
        text: "some cv text",
        jobDescription: "some job description",
      }),
    ).rejects.toThrow(OllamaJobMatchScoringParseError);

    expect(spyLog).toHaveBeenCalled();
    expect(spyCapture).toHaveBeenCalled();
  });

  it("parses valid JSON response successfully", async () => {
    mockGenerate.mockResolvedValue({
      response: JSON.stringify({
        score: 85,
        feedback: "Great candidate",
        keywordsFound: ["Node.js"],
        improvements: ["Add React"],
        jobKeyData: { title: "Backend Developer" },
        jobKeywords: ["Node.js"],
        cvKeywords: ["Node.js"],
        matchingKeywords: ["Node.js"],
        missingKeywords: [],
      }),
    });

    const telemetry = new NoOpTelemetry();
    const factory = new OllamaJobMatchScoringAIServiceFactory(telemetry);
    const service = factory.create({ model: "test-model" });

    const result = await service.score({
      text: "some cv text",
      jobDescription: "some job description",
    });

    expect(result.toPrimitives().score).toBe(85);
    expect(result.toPrimitives().feedback).toBe("Great candidate");
  });
});
