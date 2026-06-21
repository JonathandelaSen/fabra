import { ValueObject } from "@/backend/modules/shared";
import {
  CVDocument,
  type CVDocumentPrimitives,
} from "../entities/cv-document.entity";
import {
  CVStructuredProfile,
  type CVStructuredProfilePrimitives,
} from "../entities/cv-structured-profile.entity";

export interface StructuredCVProfileAndVersionPrimitives {
  profile: CVStructuredProfilePrimitives;
  version: CVDocumentPrimitives | null;
}

export class StructuredCVProfileAndVersion extends ValueObject<StructuredCVProfileAndVersionPrimitives> {
  private constructor(
    private readonly profileEntity: CVStructuredProfile,
    private readonly versionEntity: CVDocument | null,
  ) {
    super();
  }

  static create(
    profile: CVStructuredProfile,
    version: CVDocument | null,
  ): StructuredCVProfileAndVersion {
    return new StructuredCVProfileAndVersion(profile, version);
  }

  static fromPrimitives(
    primitives: StructuredCVProfileAndVersionPrimitives,
  ): StructuredCVProfileAndVersion {
    return new StructuredCVProfileAndVersion(
      CVStructuredProfile.fromPrimitives(primitives.profile),
      primitives.version ? CVDocument.fromPrimitives(primitives.version) : null,
    );
  }

  toPrimitives(): StructuredCVProfileAndVersionPrimitives {
    return {
      profile: this.profileEntity.toPrimitives(),
      version: this.versionEntity ? this.versionEntity.toPrimitives() : null,
    };
  }

  get profile(): CVStructuredProfile {
    return this.profileEntity;
  }

  get version(): CVDocument | null {
    return this.versionEntity;
  }
}
