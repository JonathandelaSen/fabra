import { describe, expect, it, vi } from "vitest";
import {
  documentRepo,
  structuredProfileRepo,
} from "./cv-library-test-helpers.test";
import { CreateTemplateCVDocumentUseCase } from "./create-template-cv-document.use-case";
import { UpsertCVStructuredProfileUseCase } from "./upsert-cv-structured-profile.use-case";
import { ApplyCVProfileStructureCopyPasteUseCase } from "./apply-cv-profile-structure-copy-paste.use-case";
import { CV_PROFILE_COPY_PASTE_MODEL } from "../../domain/services/cv-profile-copy-paste-workflow";

describe("ApplyCVProfileStructureCopyPasteUseCase", () => {
  it("saves the structured profile with external-chat provenance", async () => {
    const documents = documentRepo();
    const profileRepo = structuredProfileRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new ApplyCVProfileStructureCopyPasteUseCase({
      documentRepo: documents,
      prepareAnalysisInput: {
        execute: async () => ({ analysisText: "python text" }),
      } as never,
      upsertProfile: new UpsertCVStructuredProfileUseCase({
        profileRepo,
        eventBus: eventBus as never,
      }),
      createTemplateDocument: new CreateTemplateCVDocumentUseCase({
        documentRepo: documents,
        eventBus: eventBus as never,
      }),
    }).execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      parsedResult: {
        basics: { name: "Ada Lovelace" },
        experience: [{ company: "Analytical Engines" }],
      },
    });

    expect(result?.profile.toPrimitives()).toMatchObject({
      aiModel: CV_PROFILE_COPY_PASTE_MODEL,
      profile: {
        basics: { name: "Ada Lovelace" },
        experience: [{ company: "Analytical Engines" }],
      },
    });
    expect(result?.version).toBeNull();
  });
});
