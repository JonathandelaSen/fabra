import { ValueObject } from "@/modules/shared";

export const deleteCVDocumentStatuses = {
  deleted: "deleted",
  inUse: "in_use",
  notFound: "not_found",
} as const;

export type DeleteCVDocumentStatusPrimitives =
  (typeof deleteCVDocumentStatuses)[keyof typeof deleteCVDocumentStatuses];

export class DeleteCVDocumentStatus extends ValueObject<DeleteCVDocumentStatusPrimitives> {
  private constructor(
    private readonly value: DeleteCVDocumentStatusPrimitives
  ) {
    super();
  }

  static deleted(): DeleteCVDocumentStatus {
    return new DeleteCVDocumentStatus(deleteCVDocumentStatuses.deleted);
  }

  static inUse(): DeleteCVDocumentStatus {
    return new DeleteCVDocumentStatus(deleteCVDocumentStatuses.inUse);
  }

  static notFound(): DeleteCVDocumentStatus {
    return new DeleteCVDocumentStatus(deleteCVDocumentStatuses.notFound);
  }

  static fromPrimitives(value: string): DeleteCVDocumentStatus {
    if (
      value !== deleteCVDocumentStatuses.deleted &&
      value !== deleteCVDocumentStatuses.inUse &&
      value !== deleteCVDocumentStatuses.notFound
    ) {
      throw new Error("Invalid delete CV document status");
    }
    return new DeleteCVDocumentStatus(value);
  }

  toPrimitives(): DeleteCVDocumentStatusPrimitives {
    return this.value;
  }

  isDeleted(): boolean {
    return this.value === deleteCVDocumentStatuses.deleted;
  }

  isInUse(): boolean {
    return this.value === deleteCVDocumentStatuses.inUse;
  }

  isNotFound(): boolean {
    return this.value === deleteCVDocumentStatuses.notFound;
  }
}
