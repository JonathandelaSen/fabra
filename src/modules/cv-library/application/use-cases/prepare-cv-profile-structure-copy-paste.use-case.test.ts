import { describe, expect, it, vi } from "vitest";
import { documentRepo } from "./cv-library-test-helpers.test";
import {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "../../domain/services/cv-profile-copy-paste-workflow";
import { PrepareCVProfileStructureCopyPasteUseCase } from "./prepare-cv-profile-structure-copy-paste.use-case";

describe("PrepareCVProfileStructureCopyPasteUseCase", () => {
  it("builds an external-chat prompt for an owned CV", async () => {
    const buildPrompt = vi.fn(() => "prompt");
    const result = await new PrepareCVProfileStructureCopyPasteUseCase({
      documentRepo: documentRepo(),
      prepareAnalysisInput: {
        execute: vi.fn(async () => ({
          analysisText: "python text",
        })),
      } as never,
      buildPrompt,
    }).execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      templateId: "classic",
      locale: "es",
    });

    expect(result).toMatchObject({
      workflowId: CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
      prompt: "prompt",
      expectedResponse: { kind: "json", envelope: true },
    });
    expect(buildPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ text: "python text", templateId: "classic" }),
    );
  });
});
