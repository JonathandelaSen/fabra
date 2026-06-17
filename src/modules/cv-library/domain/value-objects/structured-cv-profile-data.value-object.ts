import { ValueObject } from "@/modules/shared";
import type { StandardCVProfilePrimitives } from "../cv-profile";
import { ProfileSchemaVersion } from "./profile-schema-version.value-object";

export interface StructuredCVProfileDataPrimitives {
  schemaVersion: string;
  profile: StandardCVProfilePrimitives;
}

export class StructuredCVProfileData extends ValueObject<StructuredCVProfileDataPrimitives> {
  private constructor(
    private readonly schemaVersionVo: ProfileSchemaVersion,
    private readonly profilePrims: StandardCVProfilePrimitives
  ) {
    super();
  }

  static fromPrimitives(
    primitives: StructuredCVProfileDataPrimitives
  ): StructuredCVProfileData {
    return new StructuredCVProfileData(
      ProfileSchemaVersion.fromPrimitives(primitives.schemaVersion),
      primitives.profile
    );
  }

  toPrimitives(): StructuredCVProfileDataPrimitives {
    return {
      schemaVersion: this.schemaVersionVo.toPrimitives(),
      profile: this.profilePrims,
    };
  }

  get schemaVersion(): string {
    return this.schemaVersionVo.toPrimitives();
  }

  get profile(): StandardCVProfilePrimitives {
    return this.profilePrims;
  }
}
