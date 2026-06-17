import { ValueObject } from "@/modules/shared";
import type {
  Commitment,
  CommitmentPrimitives,
} from "../entities/commitment.entity";
import type {
  CommitmentItem,
  CommitmentItemPrimitives,
} from "../entities/commitment-item.entity";
import type {
  CommitmentOutcome,
  CommitmentOutcomePrimitives,
} from "../entities/commitment-outcome.entity";

export interface CommitmentPortfolioPrimitives {
  commitments: CommitmentPrimitives[];
  items: CommitmentItemPrimitives[];
  outcomes: CommitmentOutcomePrimitives[];
}

export class CommitmentPortfolio extends ValueObject<CommitmentPortfolioPrimitives> {
  private constructor(
    private readonly state: {
      commitments: Commitment[];
      items: CommitmentItem[];
      outcomes: CommitmentOutcome[];
    }
  ) {
    super();
  }

  static fromCollections(collections: {
    commitments: Commitment[];
    items: CommitmentItem[];
    outcomes: CommitmentOutcome[];
  }): CommitmentPortfolio {
    return new CommitmentPortfolio({
      commitments: [...collections.commitments],
      items: [...collections.items],
      outcomes: [...collections.outcomes],
    });
  }

  get commitments(): readonly Commitment[] {
    return this.state.commitments;
  }

  get items(): readonly CommitmentItem[] {
    return this.state.items;
  }

  get outcomes(): readonly CommitmentOutcome[] {
    return this.state.outcomes;
  }

  toPrimitives(): CommitmentPortfolioPrimitives {
    return {
      commitments: this.state.commitments.map((commitment) =>
        commitment.toPrimitives()
      ),
      items: this.state.items.map((item) => item.toPrimitives()),
      outcomes: this.state.outcomes.map((outcome) => outcome.toPrimitives()),
    };
  }
}
