import { ValueObject } from "@/backend/modules/shared";

export const cvDeletionStatuses = {
  deleted: "deleted",
  inUse: "in_use",
  notFound: "not_found",
} as const;

export type CVDeletionStatusPrimitives =
  (typeof cvDeletionStatuses)[keyof typeof cvDeletionStatuses];

export class CVDeletionStatus extends ValueObject<CVDeletionStatusPrimitives> {
  private constructor(
    private readonly value: CVDeletionStatusPrimitives
  ) {
    super();
  }

  static deleted(): CVDeletionStatus {
    return new CVDeletionStatus(cvDeletionStatuses.deleted);
  }

  static inUse(): CVDeletionStatus {
    return new CVDeletionStatus(cvDeletionStatuses.inUse);
  }

  static notFound(): CVDeletionStatus {
    return new CVDeletionStatus(cvDeletionStatuses.notFound);
  }

  static fromPrimitives(value: string): CVDeletionStatus {
    if (
      value !== cvDeletionStatuses.deleted &&
      value !== cvDeletionStatuses.inUse &&
      value !== cvDeletionStatuses.notFound
    ) {
      throw new Error("Invalid delete CV document status");
    }
    return new CVDeletionStatus(value);
  }

  toPrimitives(): CVDeletionStatusPrimitives {
    return this.value;
  }

  isDeleted(): boolean {
    return this.value === cvDeletionStatuses.deleted;
  }

  isInUse(): boolean {
    return this.value === cvDeletionStatuses.inUse;
  }

  isNotFound(): boolean {
    return this.value === cvDeletionStatuses.notFound;
  }
}
