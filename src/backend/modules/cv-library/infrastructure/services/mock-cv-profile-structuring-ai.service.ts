import type { CVProfilePrimitives } from "../../domain/value-objects/cv-profile.value-object";
import { CV_PROFILE_SCHEMA_VERSION } from "../../domain/cv-profile";
import type { CVProfileStructuringAIService } from "../../domain/repositories/cv-profile-ai.service";
import { StructuredCVProfileData } from "../../domain/value-objects/structured-cv-profile-data.value-object";

class MockCVProfileStructuringAIService implements CVProfileStructuringAIService {
  async structure(input: { text: string }): Promise<StructuredCVProfileData> {
    return StructuredCVProfileData.fromPrimitives({
      schemaVersion: CV_PROFILE_SCHEMA_VERSION,
      profile: mapMockProfileToPrimitives({
        summary: `Structured senior engineering profile extracted from ${input.text.length} characters of CV content.`,
        basics: { name: "Demo Candidate" },
        experience: [],
        education: [],
        technicalSkills: [
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

function mapMockProfileToPrimitives(
  profile: CVProfilePrimitives,
): CVProfilePrimitives {
  return profile;
}

export class MockCVProfileStructuringAIServiceFactory {
  create(): CVProfileStructuringAIService {
    return new MockCVProfileStructuringAIService();
  }
}
