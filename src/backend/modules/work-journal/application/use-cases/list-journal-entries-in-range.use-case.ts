import { IsoDate, UserId } from "@/backend/modules/shared";
import type { WorkJournalEntry } from "../../domain/entities/journal-entry.entity";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";

export interface ListJournalEntriesInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListJournalEntriesInRangeUseCase {
  constructor(private readonly deps: { entryRepo: WorkJournalEntryRepository }) {}

  async execute(
    input: ListJournalEntriesInRangeInput,
  ): Promise<WorkJournalEntry[]> {
    const entries = await this.deps.entryRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      dateFrom: IsoDate.fromPrimitives(input.dateFrom),
      dateTo: IsoDate.fromPrimitives(input.dateTo),
    });
    return entries.filter((entry) => !input.contextId || entry.contextId === input.contextId);
  }
}
