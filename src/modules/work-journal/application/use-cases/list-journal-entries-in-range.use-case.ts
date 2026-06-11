import { IsoDate, UserId } from "@/modules/shared";
import type { WorkJournalEntryRepository } from "../../domain/repositories/work-journal-entry.repository";
import type { EvidenceCandidateResult } from "../queries/list-journal-entries-in-range.query";

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
  ): Promise<EvidenceCandidateResult[]> {
    const entries = await this.deps.entryRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      dateFrom: IsoDate.fromPrimitives(input.dateFrom),
      dateTo: IsoDate.fromPrimitives(input.dateTo),
    });
    return entries
      .map((entry) => entry.toPrimitives())
      .filter((p) => !input.contextId || p.contextId === input.contextId)
      .map((p) => {
        const content =
          p.finalText?.trim() || p.rawNotes?.trim() || p.topic || "";
        return { sourceId: p.id, date: p.dateStart, content };
      });
  }
}
