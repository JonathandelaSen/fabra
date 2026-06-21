import { ValueObject } from "@/backend/modules/shared";
import { CVProfile, type CVProfilePrimitives } from "./cv-profile.value-object";
import { ProfileSchemaVersion } from "./profile-schema-version.value-object";

export interface StructuredCVProfileDataPrimitives {
  schemaVersion: string;
  profile: CVProfilePrimitives;
}

export class StructuredCVProfileData extends ValueObject<StructuredCVProfileDataPrimitives> {
  private constructor(
    private readonly schemaVersionVo: ProfileSchemaVersion,
    private readonly profileVo: CVProfile,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: StructuredCVProfileDataPrimitives,
  ): StructuredCVProfileData {
    return new StructuredCVProfileData(
      ProfileSchemaVersion.fromPrimitives(primitives.schemaVersion),
      CVProfile.fromPrimitives(primitives.profile),
    );
  }

  toPrimitives(): StructuredCVProfileDataPrimitives {
    return {
      schemaVersion: this.schemaVersionVo.toPrimitives(),
      profile: this.profileVo.toPrimitives(),
    };
  }

  get schemaVersion(): string {
    return this.schemaVersionVo.toPrimitives();
  }

  get profile(): CVProfilePrimitives {
    return this.profileVo.toPrimitives();
  }
}
