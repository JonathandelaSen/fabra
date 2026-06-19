import { describe, expect, it } from "vitest";
import type { DomainEvent, EventBus } from "@/backend/modules/shared";
import { AIEntityType, AIModule, AIOperation } from "../../domain/ai-runtime/ai-runtime.types";
import { createIntegratedAIInteractionContext, runTrackedAIInteraction } from "./track-integrated-ai-interaction";

describe("runTrackedAIInteraction", () => {
  it("publishes the successful provider-call lifecycle", async () => {
    const published: DomainEvent[][] = [];
    const eventBus: EventBus = { async publish(events) { published.push(events); } };
    const context = createIntegratedAIInteractionContext({
      userId: "user-1", module: AIModule.WorkJournal,
      operation: AIOperation.DraftJournalEntry, entityType: AIEntityType.WorkJournalEntry,
      entityId: "entry-1", provider: "mock", model: "mock-model",
    });

    await expect(runTrackedAIInteraction({
      eventBus, context, prompt: "prompt", execute: async () => ({ ok: true }),
    })).resolves.toEqual({ ok: true });

    expect(published).toHaveLength(2);
    expect(published.flat().map((event) => event.eventName))
      .toEqual([
        "ai_runtime.prompt_prepared",
        "ai_runtime.request_sent",
        "ai_runtime.response_received",
        "ai_runtime.response_validated",
      ]);
  });

  it("maps invalid API key errors to InvalidApiKeyError", async () => {
    const published: DomainEvent[][] = [];
    const eventBus: EventBus = { async publish(events) { published.push(events); } };
    const context = createIntegratedAIInteractionContext({
      userId: "user-1", module: AIModule.WorkJournal,
      operation: AIOperation.DraftJournalEntry, entityType: AIEntityType.WorkJournalEntry,
      entityId: "entry-1", provider: "mock", model: "mock-model",
    });

    const rawOpenAIError = {
      status: 401,
      message: "Incorrect API key provided",
      code: "invalid_api_key",
    };

    await expect(runTrackedAIInteraction({
      eventBus,
      context,
      prompt: "prompt",
      execute: async () => {
        throw rawOpenAIError;
      },
    })).rejects.toThrowError("Incorrect API key provided");

    expect(published).toHaveLength(2);
    expect(published.flat().map((event) => event.eventName))
      .toEqual([
        "ai_runtime.prompt_prepared",
        "ai_runtime.request_sent",
        "ai_runtime.failed",
      ]);

    const failedEvent = published[1][0] as any;
    expect(failedEvent.toPrimitives().errorName).toBe("InvalidApiKeyError");
  });

  it("maps Gemini-style invalid API key errors to InvalidApiKeyError", async () => {
    const published: DomainEvent[][] = [];
    const eventBus: EventBus = { async publish(events) { published.push(events); } };
    const context = createIntegratedAIInteractionContext({
      userId: "user-1", module: AIModule.WorkJournal,
      operation: AIOperation.DraftJournalEntry, entityType: AIEntityType.WorkJournalEntry,
      entityId: "entry-1", provider: "mock", model: "mock-model",
    });

    const rawGeminiError = new Error("API key not valid. Please pass a valid API key.");

    await expect(runTrackedAIInteraction({
      eventBus,
      context,
      prompt: "prompt",
      execute: async () => {
        throw rawGeminiError;
      },
    })).rejects.toThrowError("API key not valid");

    expect(published).toHaveLength(2);
    expect(published.flat().map((event) => event.eventName))
      .toEqual([
        "ai_runtime.prompt_prepared",
        "ai_runtime.request_sent",
        "ai_runtime.failed",
      ]);

    const failedEvent = published[1][0] as any;
    expect(failedEvent.toPrimitives().errorName).toBe("InvalidApiKeyError");
  });
});

