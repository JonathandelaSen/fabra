import { IsoDate, OptionalIsoDate, UserId, type EventBus } from "@/backend/modules/shared";
import type { WorkJournalEntry } from "../../domain/entities/journal-entry.entity";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";
import { EntryNotFoundError } from "../../domain/errors/entry-not-found.error";
import { WorkJournalContextId } from "../../domain/value-objects/work-journal-context-id.value-object";
import { WorkJournalEntryId } from "../../domain/value-objects/work-journal-entry-id.value-object";
import { WorkJournalFinalText } from "../../domain/value-objects/work-journal-final-text.value-object";
import { type EntryInputMode, WorkJournalInputMode } from "../../domain/value-objects/work-journal-input-mode.value-object";
import { WorkJournalNotes } from "../../domain/value-objects/work-journal-notes.value-object";
import { WorkJournalTopic } from "../../domain/value-objects/work-journal-topic.value-object";

export interface UpdateEntryInput {
  context_id?: string;
  date_start?: string;
  date_end?: string | null;
  topic?: string | null;
  input_mode?: EntryInputMode;
  raw_notes?: string;
  final_text?: string;
}

export class UpdateEntryUseCase {
  constructor(
    private readonly deps: {
      entryRepo: WorkJournalEntryRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(id: string, userId: string, data: UpdateEntryInput): Promise<WorkJournalEntry> {
    const ownerId = UserId.fromPrimitives(userId);
    const entryId = WorkJournalEntryId.fromPrimitives(id);
    const entry = await this.deps.entryRepo.findById(entryId, ownerId);
    if (!entry) throw new EntryNotFoundError(id);
    entry.update({
      contextId: data.context_id ? WorkJournalContextId.fromPrimitives(data.context_id) : undefined,
      dateStart: data.date_start ? IsoDate.fromPrimitives(data.date_start) : undefined,
      dateEnd:
        data.date_end !== undefined
          ? OptionalIsoDate.fromPrimitives(data.date_end)
          : undefined,
      topic: data.topic !== undefined ? WorkJournalTopic.fromPrimitives(data.topic) : undefined,
      inputMode: data.input_mode ? WorkJournalInputMode.fromPrimitives(data.input_mode) : undefined,
      rawNotes: data.raw_notes ? WorkJournalNotes.fromPrimitives(data.raw_notes) : undefined,
      finalText: data.final_text ? WorkJournalFinalText.fromPrimitives(data.final_text) : undefined,
    });
    const saved = await this.deps.entryRepo.save(entry);

    const events = entry.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
