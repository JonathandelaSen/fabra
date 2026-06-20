import {
  CV_PROFILE_SCHEMA_VERSION,
  normalizeStandardCVProfile,
} from "../../domain/cv-profile";
import type { CVProfileStructuringAIService } from "../../domain/repositories/cv-profile-ai.service";
import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";

class MockCVProfileStructuringAIService
  implements CVProfileStructuringAIService
{
  async structure(input: { text: string }): Promise<StructuredCVProfileData> {
    return StructuredCVProfileData.fromPrimitives({
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: normalizeStandardCVProfile({
        summary: `Structured senior engineering profile extracted from ${input.text.length} characters of CV content.`,
        basics: { name: "Demo Candidate" },
        experience: [],
        education: [],
        skills: [
          "TypeScript",
          "React",
          "Node.js",
          "PostgreSQL",
          "System design",
          "Technical leadership",
        ],
      }),
    });
  }
}

export class MockCVProfileStructuringAIServiceFactory {
  create(): CVProfileStructuringAIService {
    return new MockCVProfileStructuringAIService();
  }
}
