import {
  CVProfile,
  type CVProfilePrimitives,
} from "../../domain/value-objects/cv-profile.value-object";
import type { CVProfileEditingAIService } from "../../domain/repositories/cv-profile-ai.service";

class MockCVProfileEditingAIService implements CVProfileEditingAIService {
  async edit(input: {
    profile: CVProfilePrimitives;
    instruction: string;
  }): Promise<CVProfile> {
    return CVProfile.fromPrimitives({
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
