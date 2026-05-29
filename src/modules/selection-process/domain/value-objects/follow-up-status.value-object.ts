import { ValueObject } from "@/modules/shared";

export type FollowUpStatusPrimitives =
  | "interesting"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "discarded";

export const FOLLOW_UP_STATUSES: readonly FollowUpStatusPrimitives[] = [
  "interesting",
  "applied",
  "interview",
  "offer",
  "rejected",
  "discarded",
];

export class FollowUpStatus extends ValueObject<FollowUpStatusPrimitives> {
  private constructor(private readonly value: FollowUpStatusPrimitives) {
    super();
  }

  static fromPrimitives(value: string): FollowUpStatus {
    if (!FOLLOW_UP_STATUSES.includes(value as FollowUpStatusPrimitives)) {
      throw new Error("Invalid follow-up status");
    }
    return new FollowUpStatus(value as FollowUpStatusPrimitives);
  }

  toPrimitives(): FollowUpStatusPrimitives {
    return this.value;
  }
}
