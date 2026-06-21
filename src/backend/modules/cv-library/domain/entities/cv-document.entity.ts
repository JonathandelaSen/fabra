import {
  AggregateRoot,
  Counter,
  LongText,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
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
import {
  CVDocumentExtractedText,
  type CVDocumentExtractedTextPrimitives,
} from "../value-objects/cv-document-extracted-text.value-object";
import {
  CVProfile,
  type CVProfilePrimitives,
} from "../value-objects/cv-profile.value-object";
import {
  CVPublicSettings,
  type CVPublicSettingsPrimitives,
} from "../value-objects/cv-public-settings.value-object";
import { AIModelName } from "../value-objects/ai-model-name.value-object";
import { ProfileSchemaVersion } from "../value-objects/profile-schema-version.value-object";
import { SourceTextHash } from "../value-objects/source-text-hash.value-object";

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
  profile: CVProfilePrimitives | null;
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
  profile: CVProfilePrimitives | null;
  extractedText: CVDocumentExtractedText;
  publicSettings: {
    enabled: boolean;
    feedbackEnabled?: boolean;
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
    private readonly documentFilename: LongText | null,
    private readonly documentFileSize: Counter | null,
    private readonly documentPdfStoragePath: LongText | null,
    private readonly documentType: CVDocumentType,
    private readonly documentSourceCvId: CVDocumentId | null,
    private readonly documentTemplateId: LongText | null,
    private documentTemplateLocale: LongText | null,
    private readonly documentSchemaVersion: ProfileSchemaVersion | null,
    private readonly documentSourceTextHash: SourceTextHash | null,
    private documentAIModel: AIModelName | null,
    private documentProfile: CVProfile | null,
    private documentExtractedText: CVDocumentExtractedText,
    private documentPublicSettings: CVPublicSettings,
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
      params.filename === null
        ? null
        : LongText.fromPrimitives(params.filename),
      params.fileSize === null ? null : Counter.fromPrimitives(params.fileSize),
      params.pdfStoragePath === null
        ? null
        : LongText.fromPrimitives(params.pdfStoragePath),
      params.type,
      params.sourceCvId === null
        ? null
        : CVDocumentId.fromPrimitives(params.sourceCvId),
      params.templateId === null
        ? null
        : LongText.fromPrimitives(params.templateId),
      params.templateLocale === null
        ? null
        : LongText.fromPrimitives(params.templateLocale),
      params.schemaVersion === null
        ? null
        : ProfileSchemaVersion.fromPrimitives(params.schemaVersion),
      params.sourceTextHash === null
        ? null
        : SourceTextHash.fromPrimitives(params.sourceTextHash),
      params.aiModel === null
        ? null
        : AIModelName.fromPrimitives(params.aiModel),
      params.profile === null ? null : CVProfile.fromPrimitives(params.profile),
      params.extractedText,
      CVPublicSettings.fromPrimitives({
        ...params.publicSettings,
        feedbackEnabled: params.publicSettings.feedbackEnabled ?? false,
      }),
      params.createdAt,
      params.updatedAt,
    );
    document.recordDomainEvent(
      new CVDocumentCreatedEvent(document.id, document.type),
    );
    return document;
  }

  static fromPrimitives(primitives: CVDocumentPrimitives): CVDocument {
    return new CVDocument(
      CVDocumentId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVDocumentName.fromPrimitives(primitives.name),
      primitives.filename === null
        ? null
        : LongText.fromPrimitives(primitives.filename),
      primitives.fileSize === null
        ? null
        : Counter.fromPrimitives(primitives.fileSize),
      primitives.pdfStoragePath === null
        ? null
        : LongText.fromPrimitives(primitives.pdfStoragePath),
      CVDocumentType.fromPrimitives(primitives.type),
      primitives.sourceCvId === null
        ? null
        : CVDocumentId.fromPrimitives(primitives.sourceCvId),
      primitives.templateId === null
        ? null
        : LongText.fromPrimitives(primitives.templateId),
      primitives.templateLocale === null
        ? null
        : LongText.fromPrimitives(primitives.templateLocale),
      primitives.schemaVersion === null
        ? null
        : ProfileSchemaVersion.fromPrimitives(primitives.schemaVersion),
      primitives.sourceTextHash === null
        ? null
        : SourceTextHash.fromPrimitives(primitives.sourceTextHash),
      primitives.aiModel === null
        ? null
        : AIModelName.fromPrimitives(primitives.aiModel),
      primitives.profile === null
        ? null
        : CVProfile.fromPrimitives(primitives.profile),
      CVDocumentExtractedText.fromPrimitives(primitives.extractedText),
      CVPublicSettings.fromPrimitives({
        ...primitives.publicSettings,
        feedbackEnabled: primitives.publicSettings.feedbackEnabled ?? false,
      }),
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

  get typeValue(): CVDocumentType {
    return this.documentType;
  }

  get pdfStoragePath(): string | null {
    return this.documentPdfStoragePath?.toPrimitives() ?? null;
  }

  rename(name: CVDocumentName, updatedAt: Timestamp): void {
    this.documentName = name;
    this.documentUpdatedAt = updatedAt;
    this.recordDomainEvent(new CVDocumentRenamedEvent(this.id));
  }

  updateTemplateProfile(input: {
    name?: CVDocumentName;
    profile?: CVProfilePrimitives;
    aiModel?: string;
    templateLocale?: string;
    updatedAt: Timestamp;
  }): void {
    if (input.name) this.documentName = input.name;
    if (input.profile !== undefined) {
      this.documentProfile = CVProfile.fromPrimitives(input.profile);
    }
    if (input.aiModel !== undefined) {
      this.documentAIModel = AIModelName.fromPrimitives(input.aiModel);
    }
    if (input.templateLocale !== undefined) {
      this.documentTemplateLocale = LongText.fromPrimitives(
        input.templateLocale,
      );
    }
    this.documentUpdatedAt = input.updatedAt;
    this.recordDomainEvent(new CVDocumentProfileUpdatedEvent(this.id));
  }

  updateExtractedText(
    extractedText: CVDocumentExtractedText,
    updatedAt: Timestamp,
  ): void {
    this.documentExtractedText = extractedText;
    this.documentUpdatedAt = updatedAt;
    this.recordDomainEvent(new CVDocumentExtractedTextUpdatedEvent(this.id));
  }

  updatePublicSettings(settings: {
    enabled: boolean;
    feedbackEnabled?: boolean;
    publicId: string | null;
    slug: string | null;
    publishedAt: Timestamp | null;
  }): void {
    this.documentPublicSettings = CVPublicSettings.fromPrimitives({
      enabled: settings.enabled,
      feedbackEnabled:
        settings.feedbackEnabled ??
        this.documentPublicSettings.toPrimitives().feedbackEnabled ??
        false,
      publicId: settings.publicId,
      slug: settings.slug,
      publishedAt: settings.publishedAt?.toPrimitives() ?? null,
    });
    if (settings.enabled) {
      this.recordDomainEvent(
        new CVDocumentPublishedEvent(this.id, settings.slug),
      );
    } else {
      this.recordDomainEvent(new CVDocumentUnpublishedEvent(this.id));
    }
  }

  delete(): void {
    this.recordDomainEvent(new CVDocumentDeletedEvent(this.id));
  }

  toPrimitives(): CVDocumentPrimitives {
    return {
      id: this.documentId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      name: this.documentName.toPrimitives(),
      filename: this.documentFilename?.toPrimitives() ?? null,
      fileSize: this.documentFileSize?.toPrimitives() ?? null,
      pdfStoragePath: this.documentPdfStoragePath?.toPrimitives() ?? null,
      type: this.documentType.toPrimitives(),
      sourceCvId: this.documentSourceCvId?.toPrimitives() ?? null,
      templateId: this.documentTemplateId?.toPrimitives() ?? null,
      templateLocale: this.documentTemplateLocale?.toPrimitives() ?? null,
      schemaVersion: this.documentSchemaVersion?.toPrimitives() ?? null,
      sourceTextHash: this.documentSourceTextHash?.toPrimitives() ?? null,
      aiModel: this.documentAIModel?.toPrimitives() ?? null,
      profile: this.documentProfile?.toPrimitives() ?? null,
      extractedText: this.documentExtractedText.toPrimitives(),
      publicSettings: this.documentPublicSettings.toPrimitives(),
      createdAt: this.documentCreatedAt.toPrimitives(),
      updatedAt: this.documentUpdatedAt.toPrimitives(),
    };
  }
}
