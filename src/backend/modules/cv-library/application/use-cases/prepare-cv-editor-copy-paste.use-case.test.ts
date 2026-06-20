import { describe, expect, it, vi } from "vitest";
import { CopyPastePreparation } from "@/backend/modules/shared";
import { PrepareCVEditorCopyPasteUseCase } from "./prepare-cv-editor-copy-paste.use-case";

const mockDocument = {
  toPrimitives: () => ({
    id: "cv-1",
    userId: "user-1",
    type: "template",
    templateId: "compact",
    templateLocale: "en",
    profile: {
      basics: { name: "Test", email: "t@t.com" },
      summary: "Summary",
      experience: [],
      skills: [],
    },
  }),
};

const mockDocumentRepo = {
  findById: vi.fn().mockResolvedValue(mockDocument),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockPromptService = {
  prepare: vi.fn().mockReturnValue(
    CopyPastePreparation.fromPrimitives({
      workflowId: "cv_editor.apply_instruction",
      schemaVersion: "1",
      prompt: "generated-prompt",
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice: "privacy",
      interactionId: null,
      attemptId: null,
    }),
  ),
};

function createUseCase() {
  return new PrepareCVEditorCopyPasteUseCase({
    documentRepo: mockDocumentRepo as never,
    promptService: mockPromptService,
  });
}

describe("PrepareCVEditorCopyPasteUseCase", () => {
  it("prepares prompt for an owned template CV", async () => {
    const useCase = createUseCase();
    const result = await useCase.execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      instruction: "Make it more executive",
    });

    expect(result).not.toBeNull();
    expect(result!.workflowId).toBe("cv_editor.apply_instruction");
    expect(result!.schemaVersion).toBe("1");
    expect(result!.prompt).toBe("generated-prompt");
    expect(result!.expectedResponse).toEqual({ kind: "json", envelope: true });
    expect(mockPromptService.prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        instruction: "Make it more executive",
        templateId: "compact",
        locale: "en",
      }),
    );
  });

  it("returns null when CV not found", async () => {
    mockDocumentRepo.findById.mockResolvedValueOnce(null);
    const useCase = createUseCase();
    const result = await useCase.execute({
      cvDocumentId: "missing",
      userId: "user-1",
      instruction: "test",
    });
    expect(result).toBeNull();
  });

  it("throws when CV is not a template", async () => {
    mockDocumentRepo.findById.mockResolvedValueOnce({
      toPrimitives: () => ({ ...mockDocument.toPrimitives(), type: "uploaded" }),
    });
    const useCase = createUseCase();
    await expect(
      useCase.execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        instruction: "test",
      }),
    ).rejects.toThrow(/template/i);
  });

  it("throws when CV has no profile", async () => {
    mockDocumentRepo.findById.mockResolvedValueOnce({
      toPrimitives: () => ({
        ...mockDocument.toPrimitives(),
        profile: null,
      }),
    });
    const useCase = createUseCase();
    await expect(
      useCase.execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        instruction: "test",
      }),
    ).rejects.toThrow(/profile/i);
  });
});
