import { UserId } from "@/modules/shared";
import type { CommitmentOutcomeRepository } from "../../domain/repositories/commitment-outcome.repository";
import type { CommitmentRepository } from "../../domain/repositories/commitment.repository";
import type { EvidenceCandidateResult } from "../queries/list-commitments-in-range.query";

export interface ListCommitmentsInRangeInput {
  userId: string;
  dateFrom: string;
  dateTo: string;
  contextId?: string | null;
}

export class ListCommitmentsInRangeUseCase {
  constructor(
    private readonly deps: {
      commitmentRepo: CommitmentRepository;
      outcomeRepo: CommitmentOutcomeRepository;
    },
  ) {}

  async execute(
    input: ListCommitmentsInRangeInput,
  ): Promise<EvidenceCandidateResult[]> {
    const userId = UserId.fromPrimitives(input.userId);
    const [commitments, outcomes] = await Promise.all([
      this.deps.commitmentRepo.search(userId),
      this.deps.outcomeRepo.searchByUser(userId),
    ]);

    const outcomesByCommitment = new Map<string, string[]>();
    for (const outcome of outcomes) {
      const o = outcome.toPrimitives();
      const list = outcomesByCommitment.get(o.commitmentId) ?? [];
      list.push(o.description ? `${o.title} — ${o.description}` : o.title);
      outcomesByCommitment.set(o.commitmentId, list);
    }

    return commitments
      .map((commitment) => commitment.toPrimitives())
      .filter((c) => {
        const overlapsPeriod =
          c.startDate <= input.dateTo &&
          (c.targetDate === null || c.targetDate >= input.dateFrom);
        return (
          overlapsPeriod &&
          (!input.contextId || c.contextId === input.contextId)
        );
      })
      .map((c) => {
        const parts = [c.title];
        if (c.resultNotes) parts.push(c.resultNotes);
        else if (c.description) parts.push(c.description);
        const related = outcomesByCommitment.get(c.id);
        if (related && related.length > 0) {
          parts.push(`Outcomes: ${related.join("; ")}`);
        }
        return {
          sourceId: c.id,
          date: c.targetDate ?? c.startDate,
          content: parts.join(" — "),
        };
      });
  }
}
