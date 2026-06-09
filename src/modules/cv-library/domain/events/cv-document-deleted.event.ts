import type { DomainEvent } from "@/modules/shared";

export class CVDocumentDeletedEvent implements DomainEvent<{ documentId: string }> {
  readonly eventName = "cv_document_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly documentId: string) {}

  toPrimitives(): { documentId: string } {
    return { documentId: this.documentId };
  }
}
