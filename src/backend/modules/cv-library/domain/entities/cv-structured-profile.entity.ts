import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { CVStructuredProfileCreatedEvent } from "../events/cv-structured-profile-created.event";
import { AIModelName } from "../value-objects/ai-model-name.value-object";
import { CVDocumentId } from "../value-objects/cv-document-id.value-object";
import { CVProfileData } from "../value-objects/cv-profile-data.value-object";
import { CVStructuredProfileId } from "../value-objects/cv-structured-profile-id.value-object";
import { ProfileSchemaVersion } from "../value-objects/profile-schema-version.value-object";
import { SourceTextHash } from "../value-objects/source-text-hash.value-object";

export interface CVStructuredProfilePrimitives {
  id: string;
  userId: string;
  cvDocumentId: string;
  schemaVersion: string;
  sourceTextHash: string;
  aiModel: string;
  profile: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CVStructuredProfileCreateParams {
  id: CVStructuredProfileId;
  userId: UserIdType;
  cvDocumentId: CVDocumentId;
  schemaVersion: ProfileSchemaVersion;
  sourceTextHash: SourceTextHash;
  aiModel: AIModelName;
  profile: unknown;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CVStructuredProfile extends AggregateRoot {
  private constructor(
    private readonly profileId: CVStructuredProfileId,
    private readonly ownerId: UserIdType,
    private readonly documentId: CVDocumentId,
    private readonly profileSchemaVersion: ProfileSchemaVersion,
    private readonly profileSourceTextHash: SourceTextHash,
    private readonly profileAIModel: AIModelName,
    private readonly profileData: unknown,
    private readonly profileCreatedAt: Timestamp,
    private readonly profileUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: CVStructuredProfileCreateParams): CVStructuredProfile {
    const profile = new CVStructuredProfile(
      params.id,
      params.userId,
      params.cvDocumentId,
      params.schemaVersion,
      params.sourceTextHash,
      params.aiModel,
      params.profile,
      params.createdAt,
      params.updatedAt
    );
    profile.recordDomainEvent(
      new CVStructuredProfileCreatedEvent(profile.id, profile.cvDocumentId)
    );
    return profile;
  }

  static fromPrimitives(
    primitives: CVStructuredProfilePrimitives
  ): CVStructuredProfile {
    return new CVStructuredProfile(
      CVStructuredProfileId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVDocumentId.fromPrimitives(primitives.cvDocumentId),
      ProfileSchemaVersion.fromPrimitives(primitives.schemaVersion),
      SourceTextHash.fromPrimitives(primitives.sourceTextHash),
      AIModelName.fromPrimitives(primitives.aiModel),
      primitives.profile,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt)
    );
  }

  get id(): string {
    return this.profileId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  get cvDocumentId(): string {
    return this.documentId.toPrimitives();
  }

  toPrimitives(): CVStructuredProfilePrimitives {
    return {
      id: this.profileId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      cvDocumentId: this.documentId.toPrimitives(),
      schemaVersion: this.profileSchemaVersion.toPrimitives(),
      sourceTextHash: this.profileSourceTextHash.toPrimitives(),
      aiModel: this.profileAIModel.toPrimitives(),
      profile: CVProfileData.fromPrimitives(this.profileData).toPrimitives(),
      createdAt: this.profileCreatedAt.toPrimitives(),
      updatedAt: this.profileUpdatedAt.toPrimitives(),
    };
  }
}
