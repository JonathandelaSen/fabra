import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { CVDocumentCreatedEvent } from "../events/cv-document-created.event";
import { CVDocumentDeletedEvent } from "../events/cv-document-deleted.event";
import { CVDocumentExtractedTextUpdatedEvent } from "../events/cv-document-extracted-text-updated.event";
import { CVDocumentProfileUpdatedEvent } from "../events/cv-document-profile-updated.event";
import { CVDocumentPublishedEvent } from "../events/cv-document-published.event";
import { CVDocumentRenamedEvent } from "../events/cv-document-renamed.event";
import { CVDocumentUnpublishedEvent } from "../events/cv-document-unpublished.event";
import {
  CVDocumentType,
  type CVDocumentTypePrimitives,
} from "../value-objects/cv-document-type.value-object";
import { CVDocumentId } from "../value-objects/cv-document-id.value-object";
import { CVDocumentName } from "../value-objects/cv-document-name.value-object";

export interface CVDocumentExtractedTextPrimitives {
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export interface CVPublicSettingsPrimitives {
  enabled: boolean;
  publicId: string | null;
  slug: string | null;
  publishedAt: string | null;
}

export interface CVDocumentPrimitives {
  id: string;
  userId: string;
  name: string;
  filename: string | null;
  fileSize: number | null;
  pdfStoragePath: string | null;
  type: CVDocumentTypePrimitives;
  sourceCvId: string | null;
  templateId: string | null;
  templateLocale: string | null;
  schemaVersion: string | null;
  sourceTextHash: string | null;
  aiModel: string | null;
  profile: unknown | null;
  extractedText: CVDocumentExtractedTextPrimitives;
  publicSettings: CVPublicSettingsPrimitives;
  createdAt: string;
  updatedAt: string;
}

export interface CVDocumentCreateParams {
  id: CVDocumentId;
  userId: UserIdType;
  name: CVDocumentName;
  filename: string | null;
  fileSize: number | null;
  pdfStoragePath: string | null;
  type: CVDocumentType;
  sourceCvId: string | null;
  templateId: string | null;
  templateLocale: string | null;
  schemaVersion: string | null;
  sourceTextHash: string | null;
  aiModel: string | null;
  profile: unknown | null;
  extractedText: CVDocumentExtractedTextPrimitives;
  publicSettings: {
    enabled: boolean;
    publicId: string | null;
    slug: string | null;
    publishedAt: string | null;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CVDocument extends AggregateRoot {
  private constructor(
    private readonly documentId: CVDocumentId,
    private readonly ownerId: UserIdType,
    private documentName: CVDocumentName,
    private readonly documentFilename: string | null,
    private readonly documentFileSize: number | null,
    private readonly documentPdfStoragePath: string | null,
    private readonly documentType: CVDocumentType,
    private readonly documentSourceCvId: string | null,
    private readonly documentTemplateId: string | null,
    private documentTemplateLocale: string | null,
    private readonly documentSchemaVersion: string | null,
    private readonly documentSourceTextHash: string | null,
    private documentAIModel: string | null,
    private documentProfile: unknown | null,
    private documentExtractedText: CVDocumentExtractedTextPrimitives,
    private documentPublicSettings: CVPublicSettingsPrimitives,
    private readonly documentCreatedAt: Timestamp,
    private documentUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: CVDocumentCreateParams): CVDocument {
    const document = new CVDocument(
      params.id,
      params.userId,
      params.name,
      params.filename,
      params.fileSize,
      params.pdfStoragePath,
      params.type,
      params.sourceCvId,
      params.templateId,
      params.templateLocale,
      params.schemaVersion,
      params.sourceTextHash,
      params.aiModel,
      params.profile,
      params.extractedText,
      params.publicSettings,
      params.createdAt,
      params.updatedAt,
    );
    document.recordDomainEvent(new CVDocumentCreatedEvent(document.id, document.type));
    return document;
  }

  static fromPrimitives(primitives: CVDocumentPrimitives): CVDocument {
    return new CVDocument(
      CVDocumentId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVDocumentName.fromPrimitives(primitives.name),
      primitives.filename,
      primitives.fileSize,
      primitives.pdfStoragePath,
      CVDocumentType.fromPrimitives(primitives.type),
      primitives.sourceCvId,
      primitives.templateId,
      primitives.templateLocale,
      primitives.schemaVersion,
      primitives.sourceTextHash,
      primitives.aiModel,
      primitives.profile,
      primitives.extractedText,
      primitives.publicSettings,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  get id(): string {
    return this.documentId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  get idValue(): CVDocumentId {
    return this.documentId;
  }

  get type(): CVDocumentTypePrimitives {
    return this.documentType.toPrimitives();
  }

  get pdfStoragePath(): string | null {
    return this.documentPdfStoragePath;
  }

  rename(name: CVDocumentName, updatedAt: Timestamp): void {
    this.documentName = name;
    this.documentUpdatedAt = updatedAt;
    this.recordDomainEvent(new CVDocumentRenamedEvent(this.id));
  }

  updateTemplateProfile(input: {
    name?: CVDocumentName;
    profile?: unknown;
    aiModel?: string;
    templateLocale?: string;
    updatedAt: Timestamp;
  }): void {
    if (input.name) this.documentName = input.name;
    if (input.profile !== undefined) this.documentProfile = input.profile;
    if (input.aiModel !== undefined) this.documentAIModel = input.aiModel;
    if (input.templateLocale !== undefined) {
      this.documentTemplateLocale = input.templateLocale;
    }
    this.documentUpdatedAt = input.updatedAt;
    this.recordDomainEvent(new CVDocumentProfileUpdatedEvent(this.id));
  }

  updateExtractedText(
    extractedText: CVDocumentExtractedTextPrimitives,
    updatedAt: Timestamp,
  ): void {
    this.documentExtractedText = extractedText;
    this.documentUpdatedAt = updatedAt;
    this.recordDomainEvent(new CVDocumentExtractedTextUpdatedEvent(this.id));
  }

  updatePublicSettings(settings: {
    enabled: boolean;
    publicId: string | null;
    slug: string | null;
    publishedAt: Timestamp | null;
  }): void {
    this.documentPublicSettings = {
      enabled: settings.enabled,
      publicId: settings.publicId,
      slug: settings.slug,
      publishedAt: settings.publishedAt?.toPrimitives() ?? null,
    };
    if (settings.enabled) {
      this.recordDomainEvent(new CVDocumentPublishedEvent(this.id, settings.slug));
    } else {
      this.recordDomainEvent(new CVDocumentUnpublishedEvent(this.id));
    }
  }

  delete(): void {
    this.recordDomainEvent(new CVDocumentDeletedEvent(this.id));
  }

  toPrimitives(): CVDocumentPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      name: this.documentName.toPrimitives(),
      filename: this.documentFilename,
      fileSize: this.documentFileSize,
      pdfStoragePath: this.documentPdfStoragePath,
      type: this.documentType.toPrimitives(),
      sourceCvId: this.documentSourceCvId,
      templateId: this.documentTemplateId,
      templateLocale: this.documentTemplateLocale,
      schemaVersion: this.documentSchemaVersion,
      sourceTextHash: this.documentSourceTextHash,
      aiModel: this.documentAIModel,
      profile: this.documentProfile,
      extractedText: this.documentExtractedText,
      publicSettings: this.documentPublicSettings,
      createdAt: this.documentCreatedAt.toPrimitives(),
      updatedAt: this.documentUpdatedAt.toPrimitives(),
    };
  }
}
