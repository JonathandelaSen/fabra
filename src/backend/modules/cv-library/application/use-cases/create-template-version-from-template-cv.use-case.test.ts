import { describe, expect, it, vi } from "vitest";
import { document, documentRepo, eventBus } from "./cv-library-test-helpers.test";
import { CreateTemplateCVDocumentUseCase } from "./create-template-cv-document.use-case";
import { CreateTemplateVersionFromTemplateCVUseCase } from "./create-template-version-from-template-cv.use-case";

function useCase(repo = documentRepo()) {
  const bus = eventBus();
  return {
    repo,
    bus,
    subject: new CreateTemplateVersionFromTemplateCVUseCase({
      documentRepo: repo,
      createTemplateDocument: new CreateTemplateCVDocumentUseCase({
        documentRepo: repo,
        eventBus: bus,
      }),
    }),
  };
}

describe("CreateTemplateVersionFromTemplateCVUseCase", () => {
  it("creates a private template version from the current template profile", async () => {
    const current = document({
      type: "template",
      name: "Jon CV · Linea",
      sourceCvId: "uploaded-cv",
      templateId: "compact",
      templateLocale: "es",
      schemaVersion: "standard-v1",
      sourceTextHash: "hash-1",
      aiModel: "mock",
      profile: { basics: { name: "Jon" } },
      extractedText: {
        textPython: null,
        textPdfjs: null,
        textNode: "Jon text",
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
    });
    const { repo, bus, subject } = useCase(
      documentRepo({ findById: vi.fn(async () => current) }),
    );

    const result = await subject.execute({
      id: "cv-1",
      userId: "user-1",
      templateId: "modern",
      templateLocale: "en",
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(result.toPrimitives()).toMatchObject({
      name: "Jon CV · Pulso",
      type: "template",
      sourceCvId: "uploaded-cv",
      templateId: "modern",
      templateLocale: "en",
      profile: { basics: { name: "Jon" } },
      publicSettings: {
        enabled: false,
        publicId: null,
        slug: null,
        publishedAt: null,
      },
    });
    expect(bus.publish).toHaveBeenCalledOnce();
  });

  it("rejects uploaded CVs because the editor flow must not invoke AI", async () => {
    const { subject } = useCase();

    await expect(
      subject.execute({
        id: "cv-1",
        userId: "user-1",
        templateId: "modern",
        templateLocale: "es",
      }),
    ).rejects.toThrow(/template CVs/i);
  });

  it("replaces the previous template suffix when the current name uses a catalog display name", async () => {
    const current = document({
      type: "template",
      name: "Jon CV · Pulso",
      templateId: "modern",
      templateLocale: "es",
      profile: { basics: { name: "Jon" } },
    });
    const { subject } = useCase(
      documentRepo({ findById: vi.fn(async () => current) }),
    );

    const result = await subject.execute({
      id: "cv-1",
      userId: "user-1",
      templateId: "classic",
      templateLocale: "es",
    });

    expect(result.toPrimitives().name).toBe("Jon CV · Marco");
  });
});
