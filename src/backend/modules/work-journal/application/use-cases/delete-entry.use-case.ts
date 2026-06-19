import { UserId, type EventBus } from "@/modules/shared";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";
import { EntryNotFoundError } from "../../domain/errors/entry-not-found.error";
import { WorkJournalEntryId } from "../../domain/value-objects/work-journal-entry-id.value-object";

export class DeleteEntryUseCase {
  constructor(
    private readonly deps: {
      entryRepo: WorkJournalEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const entryId = WorkJournalEntryId.fromPrimitives(id);
    const ownerId = UserId.fromPrimitives(userId);
    const entry = await this.deps.entryRepo.findById(entryId, ownerId);
    if (!entry) throw new EntryNotFoundError(id);

    entry.delete();
    await this.deps.entryRepo.delete(entryId, ownerId);

    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);
  }
}
