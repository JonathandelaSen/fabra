import type { DomainEvent } from "@/backend/modules/shared";

export class CVDocumentCreatedEvent implements DomainEvent<{
  documentId: string;
  type: string;
}> {
  readonly eventName = "cv_document_created";
  readonly occurredAt = new Date();

  constructor(
    private readonly documentId: string,
    private readonly type: string,
  ) {}

  toPrimitives(): { documentId: string; type: string } {
    return { documentId: this.documentId, type: this.type };
  }
}
