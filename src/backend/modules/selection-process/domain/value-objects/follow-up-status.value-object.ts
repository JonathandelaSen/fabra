import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

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

class InvalidFollowUpStatusError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_FOLLOW_UP_STATUS, "Invalid follow-up status", { value });
    this.name = "InvalidFollowUpStatusError";
  }
}

export class FollowUpStatus extends ValueObject<FollowUpStatusPrimitives> {
  private constructor(private readonly value: FollowUpStatusPrimitives) {
    super();
  }

  static fromPrimitives(value: string): FollowUpStatus {
    if (!FOLLOW_UP_STATUSES.includes(value as FollowUpStatusPrimitives)) {
      throw new InvalidFollowUpStatusError(value);
    }
    return new FollowUpStatus(value as FollowUpStatusPrimitives);
  }

  static interesting(): FollowUpStatus {
    return new FollowUpStatus("interesting");
  }

  static applied(): FollowUpStatus {
    return new FollowUpStatus("applied");
  }

  static interview(): FollowUpStatus {
    return new FollowUpStatus("interview");
  }

  static offer(): FollowUpStatus {
    return new FollowUpStatus("offer");
  }

  static rejected(): FollowUpStatus {
    return new FollowUpStatus("rejected");
  }

  static discarded(): FollowUpStatus {
    return new FollowUpStatus("discarded");
  }

  isInteresting(): boolean {
    return this.value === "interesting";
  }

  isApplied(): boolean {
    return this.value === "applied";
  }

  isInterview(): boolean {
    return this.value === "interview";
  }

  isOffer(): boolean {
    return this.value === "offer";
  }

  isRejected(): boolean {
    return this.value === "rejected";
  }

  isDiscarded(): boolean {
    return this.value === "discarded";
  }

  toPrimitives(): FollowUpStatusPrimitives {
    return this.value;
  }
}
