import type { DomainEvent } from "@/backend/modules/shared";

export class CVDocumentProfileUpdatedEvent implements DomainEvent<{ documentId: string }> {
  readonly eventName = "cv_document_profile_updated";
  readonly occurredAt = new Date();

  constructor(private readonly documentId: string) {}

  toPrimitives(): { documentId: string } {
    return { documentId: this.documentId };
  }
}
