import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { ContextNotFoundError } from "../../domain/errors/context-not-found.error";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { UpdateContextUseCase } from "./update-context.use-case";

const supabase = getSupabaseClient();

describe("UpdateContextUseCase", () => {
  it("updates a context and publishes domain events", async () => {
    const user = await createTestUser("wj-update-context");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new UpdateContextUseCase({ contextRepo, eventBus: eventBus as never });
    const context = await contextRepo.create({
      user_id: user.id,
      type: "employment",
      name: testLabel("context"),
    });

    const updated = await useCase.execute(context.id, user.id, {
      name: "Renamed context",
      is_default: true,
    });

    expect(updated.toPrimitives()).toMatchObject({
      id: context.id,
      name: "Renamed context",
      isDefault: true,
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_context_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      contextId: context.id,
      fields: ["name", "isDefault"],
    });
  });

  it("throws ContextNotFoundError when the context does not exist", async () => {
    const user = await createTestUser("wj-update-context-missing");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new UpdateContextUseCase({ contextRepo, eventBus: eventBus as never });

    await expect(
      useCase.execute(crypto.randomUUID(), user.id, { name: "Missing" })
    ).rejects.toBeInstanceOf(ContextNotFoundError);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
