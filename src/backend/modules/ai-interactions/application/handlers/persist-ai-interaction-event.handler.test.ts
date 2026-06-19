import { describe, expect, it, vi } from "vitest";
import {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionPreparedEvent,
  AIInteractionProvider,
  AIModule,
  AIOperation,
} from "@/backend/modules/shared";
import { PersistAIInteractionEventHandler } from "./persist-ai-interaction-event.handler";

describe("PersistAIInteractionEventHandler", () => {
  it("delegates infrastructure events to the record use case", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const handler = new PersistAIInteractionEventHandler({ execute });
    const event = new AIInteractionPreparedEvent({
      context: {
        interactionId: "interaction-1",
        attemptId: "attempt-1",
        userId: "user-1",
        module: AIModule.CVAnalysis,
        operation: AIOperation.ScoreCV,
        entityType: AIEntityType.CVAnalysis,
        entityId: "analysis-1",
        assistanceMode: AIAssistanceMode.CopyPaste,
        provider: AIInteractionProvider.ExternalChat,
        model: null,
      },
      prompt: "prompt",
      promptVersion: "1",
    });

    await handler.handle(event);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        interactionId: "interaction-1",
        eventName: "ai_runtime.prompt_prepared",
      }),
    );
  });
});
