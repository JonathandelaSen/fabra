import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import {
  CVDocumentExtractedText,
  type CVDocumentExtractedTextPrimitives,
} from "../../domain/value-objects/cv-document-extracted-text.value-object";

export interface UpdateCVDocumentExtractionInput {
  id: string;
  userId: string;
  extractedText: CVDocumentExtractedTextPrimitives;
}

export class UpdateCVDocumentExtractionUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: UpdateCVDocumentExtractionInput,
  ): Promise<CVDocument | null> {
    const id = CVDocumentId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const document = await this.deps.documentRepo.findById(id, userId);
    if (!document) return null;

    document.updateExtractedText(
      CVDocumentExtractedText.fromPrimitives(input.extractedText),
      Timestamp.fromPrimitives(new Date().toISOString()),
    );
    const saved = await this.deps.documentRepo.save(document);

    const events = document.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
