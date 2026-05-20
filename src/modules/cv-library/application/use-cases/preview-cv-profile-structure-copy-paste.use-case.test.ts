import { describe, expect, it } from "vitest";
import { documentRepo, tracker } from "./cv-library-test-helpers.test";
import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-profile-copy-paste-workflow";
import { PreviewCVProfileStructureCopyPasteUseCase } from "./preview-cv-profile-structure-copy-paste.use-case";

const validResponse = JSON.stringify({
  workflowId: CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
  schemaVersion: CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  result: {
    basics: { name: "Ada Lovelace", email: "ada@example.com" },
    summary: "Mathematician and programmer.",
    experience: [{ company: "Analytical Engines", role: "Programmer" }],
    skills: [{ name: "Core", items: ["Algorithms"] }],
  },
});

describe("PreviewCVProfileStructureCopyPasteUseCase", () => {
  it("previews a valid structured profile response", async () => {
    const result = await new PreviewCVProfileStructureCopyPasteUseCase({
      documentRepo: documentRepo(),
      tracker: tracker(),
    }).execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      rawResponse: validResponse,
    });

    expect(result?.preview).toMatchObject({
      basicsName: "Ada Lovelace",
      sectionsCount: 4,
      completeness: 100,
      originLabel: "external_chat",
    });
  });

  it("rejects invalid JSON", async () => {
    await expect(
      new PreviewCVProfileStructureCopyPasteUseCase({
        documentRepo: documentRepo(),
        tracker: tracker(),
      }).execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        rawResponse: "not json",
      }),
    ).rejects.toThrow("not valid JSON");
  });
});
