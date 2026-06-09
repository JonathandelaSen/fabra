import type { DomainEvent } from "@/modules/shared";

export class CVDocumentUnpublishedEvent implements DomainEvent<{ documentId: string }> {
  readonly eventName = "cv_document_unpublished";
  readonly occurredAt = new Date();

  constructor(private readonly documentId: string) {}

  toPrimitives(): { documentId: string } {
    return { documentId: this.documentId };
  }
}
