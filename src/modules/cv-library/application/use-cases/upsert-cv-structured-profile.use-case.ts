import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import { CV_PROFILE_SCHEMA_VERSION } from "../../domain/cv-profile";
import { CVStructuredProfile } from "../../domain/entities/cv-structured-profile.entity";
import type { CVStructuredProfileRepository } from "../../domain/repositories/cv-structured-profile.repository";
import { AIModelName } from "../../domain/value-objects/ai-model-name.value-object";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVStructuredProfileId } from "../../domain/value-objects/cv-structured-profile-id.value-object";
import { ProfileSchemaVersion } from "../../domain/value-objects/profile-schema-version.value-object";
import { SourceTextHash } from "../../domain/value-objects/source-text-hash.value-object";

export interface UpsertCVStructuredProfileInput {
  userId: string;
  cvDocumentId: string;
  schemaVersion?: string;
  sourceTextHash: string;
  aiModel: string;
  profile: unknown;
}

export class UpsertCVStructuredProfileUseCase {
  constructor(
    private readonly deps: {
      profileRepo: CVStructuredProfileRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: UpsertCVStructuredProfileInput): Promise<CVStructuredProfile> {
    const now = new Date().toISOString();
    const existing = await this.deps.profileRepo.findByDocumentId(
      CVDocumentId.fromPrimitives(input.cvDocumentId),
      UserId.fromPrimitives(input.userId),
      ProfileSchemaVersion.fromPrimitives(input.schemaVersion ?? CV_PROFILE_SCHEMA_VERSION)
    );
    const structured = CVStructuredProfile.create({
      id: CVStructuredProfileId.fromPrimitives(existing?.id ?? crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      cvDocumentId: CVDocumentId.fromPrimitives(input.cvDocumentId),
      schemaVersion: ProfileSchemaVersion.fromPrimitives(
        input.schemaVersion ?? CV_PROFILE_SCHEMA_VERSION
      ),
      sourceTextHash: SourceTextHash.fromPrimitives(input.sourceTextHash),
      aiModel: AIModelName.fromPrimitives(input.aiModel),
      profile: input.profile,
      createdAt: Timestamp.fromPrimitives(existing?.toPrimitives().createdAt ?? now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.profileRepo.save(structured);

    const events = structured.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
