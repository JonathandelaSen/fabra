import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import type { JournalAIService } from "../../domain/repositories/journal-ai-service.repository";
import { DraftEntryUseCase } from "./draft-entry.use-case";
import { WorkJournalDraft } from "../../domain/value-objects/work-journal-draft.value-object";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";

describe("DraftEntryUseCase", () => {
  it("passes provided context and draft data to the AI service", async () => {
    const user = await createTestUser("wj-draft-entry");
    const aiService: JournalAIService = {
      draftEntry: vi.fn(async () =>
        WorkJournalFinalText.fromPrimitives("Drafted final text"),
      ),
    };
    const useCase = new DraftEntryUseCase({
      aiFactory: { create: vi.fn(() => aiService) },
      eventBus: { async publish() {} },
    });

    const result = await useCase.execute(user.id, "context-1", {
      provider: "mock",
      model: "mock-model",
      context: {
        type: "employment",
        name: testLabel("context"),
        roleOrLabel: "Lead Engineer",
      },
      dateStart: "2026-08-01",
      dateEnd: "2026-08-02",
      topic: "Launch",
      notes: "Coordinated release",
    });

    expect(result).toBeInstanceOf(WorkJournalDraft);
    expect(result.toPrimitives()).toBe("Drafted final text");
    expect(aiService.draftEntry).toHaveBeenCalledWith({
      context: expect.objectContaining({
        type: "employment",
        roleOrLabel: "Lead Engineer",
      }),
      dateStart: "2026-08-01",
      dateEnd: "2026-08-02",
      topic: "Launch",
      notes: "Coordinated release",
    });
  });
});
