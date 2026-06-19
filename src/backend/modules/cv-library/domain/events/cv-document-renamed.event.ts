import type { DomainEvent } from "@/modules/shared";

export class CVDocumentRenamedEvent implements DomainEvent<{ documentId: string }> {
  readonly eventName = "cv_document_renamed";
  readonly occurredAt = new Date();

  constructor(private readonly documentId: string) {}

  toPrimitives(): { documentId: string } {
    return { documentId: this.documentId };
  }
}
