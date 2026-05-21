import { describe, expect, it, vi } from "vitest";
import { PreviewCVEditorCopyPasteUseCase } from "./preview-cv-editor-copy-paste.use-case";

const currentProfile = {
  basics: { name: "Test", email: "t@t.com" },
  summary: "Original summary",
  experience: [{ company: "Acme", role: "Dev", bullets: ["Did stuff"] }],
  skills: [{ name: "Core", items: ["TS"] }],
};

const mockDocument = {
  toPrimitives: () => ({
    id: "cv-1",
    userId: "user-1",
    type: "template",
    profile: currentProfile,
  }),
};

const mockDocumentRepo = {
  findById: vi.fn().mockResolvedValue(mockDocument),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockTracker = {
  record: vi.fn().mockResolvedValue(undefined),
};

function createUseCase() {
  return new PreviewCVEditorCopyPasteUseCase({
    documentRepo: mockDocumentRepo as never,
    tracker: mockTracker,
  });
}

const validResponse = JSON.stringify({
  workflowId: "cv_editor.apply_instruction",
  schemaVersion: "1",
  result: {
    basics: { name: "Test Edited", email: "t@t.com" },
    summary: "Updated summary",
    experience: [{ company: "Acme", role: "Dev", bullets: ["Did stuff"] }],
    skills: [{ name: "Core", items: ["TS"] }],
  },
});

describe("PreviewCVEditorCopyPasteUseCase", () => {
  it("validates and previews a valid edited profile", async () => {
    const useCase = createUseCase();
    const result = await useCase.execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      rawResponse: validResponse,
    });

    expect(result).not.toBeNull();
    expect(result!.parsedResult.basics?.name).toBe("Test Edited");
    expect(result!.preview.basicsName).toBe("Test Edited");
    expect(result!.preview.changedSections).toContain("basics");
    expect(result!.preview.changedSections).toContain("summary");
    expect(result!.preview.originLabel).toBe("external_chat");
  });

  it("returns null when CV not found", async () => {
    mockDocumentRepo.findById.mockResolvedValueOnce(null);
    const useCase = createUseCase();
    const result = await useCase.execute({
      cvDocumentId: "missing",
      userId: "user-1",
      rawResponse: validResponse,
    });
    expect(result).toBeNull();
  });

  it("rejects invalid JSON", async () => {
    const useCase = createUseCase();
    await expect(
      useCase.execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        rawResponse: "not json",
      }),
    ).rejects.toThrow();
  });

  it("rejects profile without meaningful data", async () => {
    const emptyResponse = JSON.stringify({
      workflowId: "cv_editor.apply_instruction",
      schemaVersion: "1",
      result: {},
    });
    const useCase = createUseCase();
    await expect(
      useCase.execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        rawResponse: emptyResponse,
      }),
    ).rejects.toThrow(/usable/i);
  });
});
