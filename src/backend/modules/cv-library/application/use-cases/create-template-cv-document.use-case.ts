import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVDocumentName } from "../../domain/value-objects/cv-document-name.value-object";
import { CVDocumentType } from "../../domain/value-objects/cv-document-type.value-object";
import { CVDocumentExtractedText } from "../../domain/value-objects/cv-document-extracted-text.value-object";

export interface CreateTemplateCVDocumentInput {
  userId: string;
  sourceCvId: string;
  name: string;
  templateId: string;
  templateLocale: string;
  schemaVersion: string;
  sourceTextHash: string;
  aiModel: string;
  profile: unknown;
  filename?: string | null;
  textNode?: string | null;
}

export class CreateTemplateCVDocumentUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateTemplateCVDocumentInput): Promise<CVDocument> {
    const now = new Date().toISOString();
    const document = CVDocument.create({
      id: CVDocumentId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      name: CVDocumentName.fromPrimitives(input.name),
      filename: input.filename ?? null,
      fileSize: null,
      pdfStoragePath: null,
      type: CVDocumentType.fromPrimitives("template"),
      sourceCvId: input.sourceCvId,
      templateId: input.templateId,
      templateLocale: input.templateLocale,
      schemaVersion: input.schemaVersion,
      sourceTextHash: input.sourceTextHash,
      aiModel: input.aiModel,
      profile: input.profile,
      extractedText: CVDocumentExtractedText.fromPrimitives({
        textPython: null,
        textPdfjs: null,
        textNode: input.textNode ?? null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      }),
      publicSettings: {
        enabled: false,
        publicId: null,
        slug: null,
        publishedAt: null,
      },
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.documentRepo.save(document);

    const events = document.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
