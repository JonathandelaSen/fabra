import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/modules/test-helpers/setup";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { CreateContextUseCase } from "./create-context.use-case";

const supabase = getSupabaseClient();

describe("CreateContextUseCase", () => {
  it("creates a context and publishes domain events", async () => {
    const user = await createTestUser("wj-create-context");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreateContextUseCase({ contextRepo, eventBus: eventBus as never });
    const name = testLabel("context");

    const created = await useCase.execute({
      user_id: user.id,
      type: "employment",
      name,
      role_or_label: "Staff Engineer",
      is_default: true,
    });

    await expect(contextRepo.list(user.id)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id, name })])
    );
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_context_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      contextId: created.id,
    });
  });
});
