import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import type { CVPdfStorage } from "../../domain/repositories/cv-analysis-preparation-services";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVDocumentName } from "../../domain/value-objects/cv-document-name.value-object";
import { CVDocumentType } from "../../domain/value-objects/cv-document-type.value-object";
import {
  mapJsonResumeToProfile,
  type JsonResumeMapperResult,
} from "../../domain/services/json-resume-mapper";
import { CV_PROFILE_SCHEMA_VERSION } from "../../domain/cv-profile";
import { JsonResumeValidationError } from "../../domain/errors/json-resume-validation.error";

export interface CreateJsonResumeCVDocumentInput {
  userId: string;
  name?: string;
  jsonContent: string;
  filename?: string | null;
}

import { ImportedCVDocument } from "../../domain/value-objects/imported-cv-document.value-object";

export class CreateJsonResumeCVDocumentUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      pdfStorage: CVPdfStorage;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    input: CreateJsonResumeCVDocumentInput
  ): Promise<ImportedCVDocument> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.jsonContent);
    } catch {
      throw new JsonResumeValidationError("content is not valid JSON");
    }

    const { profile, warnings }: JsonResumeMapperResult =
      mapJsonResumeToProfile(parsed);

    const docId = crypto.randomUUID();
    const storagePath = `${input.userId}/${docId}.json`;

    await this.deps.pdfStorage.upload({
      path: storagePath,
      buffer: Buffer.from(input.jsonContent, "utf-8"),
      contentType: "application/json",
      upsert: false,
    });

    const name =
      input.name || profile.basics?.name || input.filename || "JSON Resume";
    const now = new Date().toISOString();

    const document = CVDocument.create({
      id: CVDocumentId.fromPrimitives(docId),
      userId: UserId.fromPrimitives(input.userId),
      name: CVDocumentName.fromPrimitives(name),
      filename: input.filename ?? "resume.json",
      fileSize: Buffer.byteLength(input.jsonContent, "utf-8"),
      pdfStoragePath: storagePath,
      type: CVDocumentType.fromPrimitives("json_resume"),
      sourceCvId: null,
      templateId: null,
      templateLocale: null,
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      sourceTextHash: null,
      aiModel: null,
      profile,
      extractedText: {
        textPython: null,
        textPdfjs: null,
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
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

    return ImportedCVDocument.create(saved, warnings);
  }
}
