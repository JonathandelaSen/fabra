import type { StandardCVProfile } from "../../domain/cv-profile";
import type { CVProfileEditingAIService } from "../../domain/repositories/cv-profile-ai.service";
import { EditedCVProfile } from "../../domain/value-objects/edited-cv-profile.value-object";

class MockCVProfileEditingAIService implements CVProfileEditingAIService {
  async edit(input: {
    profile: StandardCVProfile;
    instruction: string;
  }): Promise<EditedCVProfile> {
    return EditedCVProfile.fromPrimitives({
      ...input.profile,
      summary: `${input.instruction} ${input.profile.summary ?? ""}`.trim(),
    });
  }
}

export class MockCVProfileEditingAIServiceFactory {
  create(): CVProfileEditingAIService {
    return new MockCVProfileEditingAIService();
  }
}
