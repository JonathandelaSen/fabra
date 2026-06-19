import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { EntryNotFoundError } from "../../domain/errors/entry-not-found.error";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { SupabaseWorkJournalEntryRepository } from "../../infrastructure/repositories/supabase-work-journal-entry.repository";
import { UpdateEntryUseCase } from "./update-entry.use-case";

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
    useCase: new UpdateEntryUseCase({ entryRepo, eventBus: eventBus as never }),
  };
}

async function createContext(contextRepo: SupabaseWorkJournalContextRepository, userId: string) {
  return contextRepo.create({
    user_id: userId,
    type: "employment",
    name: testLabel("context"),
  });
}

describe("UpdateEntryUseCase", () => {
  it("updates fields on an existing entry and publishes domain events", async () => {
    const user = await createTestUser("wj-update-entry");
    const { contextRepo, entryRepo, eventBus, useCase } = makeUseCase();
    const context = await createContext(contextRepo, user.id);
    const entry = await entryRepo.create({
      user_id: user.id,
      context_id: context.id,
      date_start: "2026-06-01",
      date_end: null,
      topic: "Old",
      input_mode: "manual",
      raw_notes: "Old notes",
      final_text: "Old text",
    });

    const updated = await useCase.execute(entry.id, user.id, {
      topic: "New",
      final_text: "New text",
    });

    expect(updated.toPrimitives()).toMatchObject({ id: entry.id, topic: "New", finalText: "New text" });
    await expect(
      entryRepo.getById(entry.id, user.id).then((result) => result?.toPrimitives())
    ).resolves.toMatchObject({
      topic: "New",
      finalText: "New text",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_entry_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      entryId: entry.id,
      fields: ["topic", "finalText"],
    });
  });

  it("throws EntryNotFoundError when the entry does not exist", async () => {
    const user = await createTestUser("wj-update-entry-missing");
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute(crypto.randomUUID(), user.id, { topic: "Missing" })
    ).rejects.toBeInstanceOf(EntryNotFoundError);
  });

  it("updates the context id without loading the context aggregate", async () => {
    const user = await createTestUser("wj-update-entry-context-id");
    const { contextRepo, entryRepo, useCase } = makeUseCase();
    const context = await createContext(contextRepo, user.id);
    const entry = await entryRepo.create({
      user_id: user.id,
      context_id: context.id,
      date_start: "2026-06-01",
      date_end: null,
      topic: "Move",
      input_mode: "manual",
      raw_notes: "Move notes",
      final_text: "Move text",
    });

    const nextContext = await createContext(contextRepo, user.id);
    const nextContextId = nextContext.id;
    const updated = await useCase.execute(entry.id, user.id, { context_id: nextContextId });

    expect(updated.contextId).toBe(nextContextId);
  });
});
