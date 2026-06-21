import type { DomainEvent } from "@/backend/modules/shared";

export class CVDocumentExtractedTextUpdatedEvent implements DomainEvent<{
  documentId: string;
}> {
  readonly eventName = "cv_document_extracted_text_updated";
  readonly occurredAt = new Date();

  constructor(private readonly documentId: string) {}

  toPrimitives(): { documentId: string } {
    return { documentId: this.documentId };
  }
}
