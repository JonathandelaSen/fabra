import { describe, expect, it } from "vitest";
import { EditCVProfileWithAIUseCase } from "./edit-cv-profile-with-ai.use-case";
import type {
  CVProfileEditingAIService,
  CVProfileEditingAIServiceFactory,
} from "../../domain/repositories/cv-profile-ai.service";
import {
  CVProfile,
  type CVProfilePrimitives,
} from "../../domain/value-objects/cv-profile.value-object";

describe("EditCVProfileWithAIUseCase", () => {
  it("creates a configured AI service and forwards the editing input", async () => {
    const calls: unknown[] = [];
    const original: CVProfilePrimitives = {
      basics: { name: "Ada" },
      presentation: { accentColor: "#111111" },
    };
    const factory: CVProfileEditingAIServiceFactory = {
      create(config): CVProfileEditingAIService {
        calls.push(config);
        return {
          async edit(input) {
            calls.push(input);
            return CVProfile.fromPrimitives({
              ...input.profile,
              summary: "Edited",
            });
          },
        };
      },
    };

    const result = await new EditCVProfileWithAIUseCase({
      aiFactory: factory,
      eventBus: { async publish() {} },
    }).execute({
      provider: "mock",
      apiKey: "key",
      model: "gemini-test",
      profile: original,
      instruction: "Make it concise",
      templateId: "compact",
      locale: "es",
      recommendations: ["Add truthful TypeScript impact"],
      userId: "user-1",
      documentId: "document-1",
    });

    expect(calls).toEqual([
      { provider: "mock", apiKey: "key", model: "gemini-test" },
      {
        profile: original,
        instruction: "Make it concise",
        templateId: "compact",
        locale: "es",
        recommendations: ["Add truthful TypeScript impact"],
      },
    ]);
    expect(result.summary).toBe("Edited");
  });
});
