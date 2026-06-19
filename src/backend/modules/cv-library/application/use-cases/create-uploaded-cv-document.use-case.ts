import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVDocumentName } from "../../domain/value-objects/cv-document-name.value-object";
import { CVDocumentType } from "../../domain/value-objects/cv-document-type.value-object";

export interface CreateUploadedCVDocumentInput {
  id: string;
  userId: string;
  name: string;
  filename: string | null;
  fileSize: number | null;
  pdfStoragePath: string | null;
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export class CreateUploadedCVDocumentUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: CreateUploadedCVDocumentInput): Promise<CVDocument> {
    const now = new Date().toISOString();
    const document = CVDocument.create({
      id: CVDocumentId.fromPrimitives(input.id),
      userId: UserId.fromPrimitives(input.userId),
      name: CVDocumentName.fromPrimitives(input.name),
      filename: input.filename,
      fileSize: input.fileSize,
      pdfStoragePath: input.pdfStoragePath,
      type: CVDocumentType.fromPrimitives("uploaded"),
      sourceCvId: null,
      templateId: null,
      templateLocale: null,
      schemaVersion: null,
      sourceTextHash: null,
      aiModel: null,
      profile: null,
      extractedText: {
        textPython: input.textPython,
        textPdfjs: input.textPdfjs,
        textNode: input.textNode,
        extractErrorPython: input.extractErrorPython,
        extractErrorPdfjs: input.extractErrorPdfjs,
        extractErrorNode: input.extractErrorNode,
      },
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
