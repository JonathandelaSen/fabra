import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { SupabaseWorkJournalEntryRepository } from "../../infrastructure/repositories/supabase-work-journal-entry.repository";
import { CreateEntryUseCase } from "./create-entry.use-case";

const supabase = getSupabaseClient();

function makeUseCase() {
  const contextRepo = new SupabaseWorkJournalContextRepository();
  contextRepo.bindRequest(supabase);
  const entryRepo = new SupabaseWorkJournalEntryRepository();
  entryRepo.bindRequest(supabase);
  const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
  return {
    contextRepo,
    entryRepo,
    eventBus,
    useCase: new CreateEntryUseCase({ entryRepo, eventBus: eventBus as never }),
  };
}

describe("CreateEntryUseCase", () => {
  it("creates an entry for the provided context id", async () => {
    const user = await createTestUser("wj-create-entry");
    const { contextRepo, entryRepo, eventBus, useCase } = makeUseCase();
    const context = await contextRepo.create({
      user_id: user.id,
      type: "employment",
      name: testLabel("context"),
    });

    const entry = await useCase.execute({
      user_id: user.id,
      context_id: context.id,
      date_start: "2026-05-01",
      date_end: null,
      topic: "Integration",
      input_mode: "manual",
      raw_notes: "Added integration tests",
      final_text: "Added integration tests.",
    });

    await expect(
      entryRepo.getById(entry.id, user.id).then((result) => result?.toPrimitives())
    ).resolves.toMatchObject({
      id: entry.id,
      topic: "Integration",
      rawNotes: "Added integration tests",
      finalText: "Added integration tests.",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_entry_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
    });
  });
});
