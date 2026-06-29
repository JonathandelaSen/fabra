import { ValueObject } from "@/backend/modules/shared";
import {
  FollowUpEntry,
  type FollowUpEntryPrimitives,
} from "../entities/follow-up-entry.entity";
import { FollowUp, type FollowUpPrimitives } from "../entities/follow-up.entity";

export interface FollowUpTrackingReadModelPrimitives {
  followUp: FollowUpPrimitives;
  entries: FollowUpEntryPrimitives[];
}

export class FollowUpTrackingReadModel extends ValueObject<FollowUpTrackingReadModelPrimitives> {
  private constructor(
    public readonly followUp: FollowUp,
    private readonly entryValues: FollowUpEntry[],
  ) {
    super();
  }

  static fromPrimitives(
    primitives: FollowUpTrackingReadModelPrimitives,
  ): FollowUpTrackingReadModel {
    return new FollowUpTrackingReadModel(
      FollowUp.fromPrimitives(primitives.followUp),
      primitives.entries.map(FollowUpEntry.fromPrimitives),
    );
  }

  get entries(): FollowUpEntry[] {
    return [...this.entryValues];
  }

  toPrimitives(): FollowUpTrackingReadModelPrimitives {
    return {
      followUp: this.followUp.toPrimitives(),
      entries: this.entryValues.map((entry) => entry.toPrimitives()),
    };
  }
}
