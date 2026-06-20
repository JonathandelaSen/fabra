import { ValueObject } from "@/backend/modules/shared";
import type { StandardCVProfilePrimitives } from "../cv-profile";
import { CVProfile } from "./cv-profile.value-object";

export class EditedCVProfile extends ValueObject<StandardCVProfilePrimitives> {
  private constructor(private readonly profile: CVProfile) {
    super();
  }

  static fromPrimitives(
    profile: StandardCVProfilePrimitives,
  ): EditedCVProfile {
    return new EditedCVProfile(CVProfile.fromPrimitives(profile));
  }

  toPrimitives(): StandardCVProfilePrimitives {
    return this.profile.toPrimitives();
  }
}
