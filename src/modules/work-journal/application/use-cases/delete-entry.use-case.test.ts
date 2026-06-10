import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/modules/test-helpers/setup";
import { EntryNotFoundError } from "../../domain/errors/entry-not-found.error";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { SupabaseWorkJournalEntryRepository } from "../../infrastructure/repositories/supabase-work-journal-entry.repository";
import { DeleteEntryUseCase } from "./delete-entry.use-case";

const supabase = getSupabaseClient();

describe("DeleteEntryUseCase", () => {
  it("deletes an existing entry and publishes domain events", async () => {
    const user = await createTestUser("wj-delete-entry");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const entryRepo = new SupabaseWorkJournalEntryRepository();
    entryRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new DeleteEntryUseCase({
      entryRepo,
      eventBus: eventBus as never,
    });
    const context = await contextRepo.create({
      user_id: user.id,
      type: "employment",
      name: testLabel("context"),
    });
    const entry = await entryRepo.create({
      user_id: user.id,
      context_id: context.id,
      date_start: "2026-07-01",
      date_end: null,
      topic: "Delete",
      input_mode: "manual",
      raw_notes: "Delete notes",
      final_text: "Delete text",
    });

    await useCase.execute(entry.id, user.id);

    await expect(entryRepo.getById(entry.id, user.id)).resolves.toBeNull();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_entry_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
    });
  });

  it("throws EntryNotFoundError when the entry does not exist", async () => {
    const user = await createTestUser("wj-delete-entry-missing");
    const entryRepo = new SupabaseWorkJournalEntryRepository();
    entryRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new DeleteEntryUseCase({
      entryRepo,
      eventBus: eventBus as never,
    });

    await expect(useCase.execute(crypto.randomUUID(), user.id)).rejects.toBeInstanceOf(
      EntryNotFoundError
    );
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
