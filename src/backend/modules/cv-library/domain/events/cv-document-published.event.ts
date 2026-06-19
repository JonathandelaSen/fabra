import type { DomainEvent } from "@/backend/modules/shared";

export class CVDocumentPublishedEvent implements DomainEvent<{ documentId: string; slug: string | null }> {
  readonly eventName = "cv_document_published";
  readonly occurredAt = new Date();

  constructor(
    private readonly documentId: string,
    private readonly slug: string | null
  ) {}

  toPrimitives(): { documentId: string; slug: string | null } {
    return { documentId: this.documentId, slug: this.slug };
  }
}
