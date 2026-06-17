import type { CommitmentItem } from "../../domain/entities/commitment-item.entity";
import type { CommitmentOutcome } from "../../domain/entities/commitment-outcome.entity";
import type { Commitment } from "../../domain/entities/commitment.entity";
import type { CommitmentPortfolio } from "../../domain/value-objects/commitment-portfolio.value-object";

export interface CommitmentWorkspaceItem {
  commitment: ReturnType<Commitment["toPrimitives"]>;
  items: ReturnType<CommitmentItem["toPrimitives"]>[];
  outcomes: ReturnType<CommitmentOutcome["toPrimitives"]>[];
}

export function presentCommitment(commitment: Commitment) {
  return commitment.toPrimitives();
}

export function presentCommitmentItem(item: CommitmentItem) {
  return item.toPrimitives();
}

export function presentCommitmentOutcome(outcome: CommitmentOutcome) {
  return outcome.toPrimitives();
}

export function presentCommitmentsWorkspace(portfolio: CommitmentPortfolio) {
  return {
    contexts: [],
    commitments: portfolio.commitments.map((commitment) => {
      const primitives = commitment.toPrimitives();
      return {
        ...primitives,
        items: portfolio.items
          .map((item) => item.toPrimitives())
          .filter((item) => item.commitmentId === primitives.id),
        outcomes: portfolio.outcomes
          .map((outcome) => outcome.toPrimitives())
          .filter((outcome) => outcome.commitmentId === primitives.id),
      };
    }),
  };
}
