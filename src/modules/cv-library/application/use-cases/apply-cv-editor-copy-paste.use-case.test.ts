import { describe, expect, it, vi } from "vitest";
import { ApplyCVEditorCopyPasteUseCase } from "./apply-cv-editor-copy-paste.use-case";

const mockDocument = {
  toPrimitives: () => ({
    id: "cv-1",
    userId: "user-1",
    type: "template",
    profile: { basics: { name: "Original" }, summary: "Old" },
  }),
};

const mockUpdatedDocument = {
  toPrimitives: () => ({
    id: "cv-1",
    userId: "user-1",
    type: "template",
    profile: { basics: { name: "Edited" }, summary: "New" },
  }),
};

const mockDocumentRepo = {
  findById: vi.fn().mockResolvedValue(mockDocument),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockUpdateProfile = {
  execute: vi.fn().mockResolvedValue(mockUpdatedDocument),
};

function createUseCase() {
  return new ApplyCVEditorCopyPasteUseCase({
    documentRepo: mockDocumentRepo as never,
    updateProfile: mockUpdateProfile as never,
  });
}

describe("ApplyCVEditorCopyPasteUseCase", () => {
  it("applies a valid edited profile and records provenance", async () => {
    const useCase = createUseCase();
    const validProfile = {
      basics: { name: "Edited", email: "e@e.com" },
      summary: "New summary",
      experience: [{ company: "X", role: "Y", bullets: ["Z"] }],
    };

    const result = await useCase.execute({
      cvDocumentId: "cv-1",
      userId: "user-1",
      parsedResult: validProfile,
    });

    expect(result).not.toBeNull();
    expect(mockUpdateProfile.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cv-1",
        userId: "user-1",
        aiModel: "external-chat",
      }),
    );
  });

  it("returns null when CV not found", async () => {
    mockDocumentRepo.findById.mockResolvedValueOnce(null);
    const useCase = createUseCase();
    const result = await useCase.execute({
      cvDocumentId: "missing",
      userId: "user-1",
      parsedResult: { basics: { name: "X" } },
    });
    expect(result).toBeNull();
  });

  it("rejects empty profile data", async () => {
    const useCase = createUseCase();
    await expect(
      useCase.execute({
        cvDocumentId: "cv-1",
        userId: "user-1",
        parsedResult: {},
      }),
    ).rejects.toThrow(/usable/i);
  });
});
