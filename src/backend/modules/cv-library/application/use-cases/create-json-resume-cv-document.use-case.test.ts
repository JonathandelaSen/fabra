import { describe, expect, it, vi } from "vitest";
import { documentRepo } from "./cv-library-test-helpers.test";
import { CreateJsonResumeCVDocumentUseCase } from "./create-json-resume-cv-document.use-case";
import { JsonResumeValidationError } from "../../domain/errors/json-resume-validation.error";

const VALID_JSON_RESUME = JSON.stringify({
  basics: { name: "Jane Smith", label: "Developer", email: "jane@test.com" },
  work: [{ name: "Acme", position: "Dev", startDate: "2020-01-01" }],
  education: [{ institution: "MIT", studyType: "BSc", area: "CS" }],
  skills: [{ name: "Frontend", keywords: ["React"] }],
});

function pdfStorage() {
  return {
    download: vi.fn(),
    upload: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
  };
}

describe("CreateJsonResumeCVDocumentUseCase", () => {
  it("creates a json_resume document with mapped profile and publishes domain events", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const storage = pdfStorage();

    const { document, warnings } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: repo,
      pdfStorage: storage,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      jsonContent: VALID_JSON_RESUME,
      filename: "my-resume.json",
    });

    const primitives = document.toPrimitives();
    expect(primitives.type).toBe("json_resume");
    expect(primitives.profile).toMatchObject({ basics: { name: "Jane Smith" } });
    expect(primitives.schemaVersion).toBe("cv-profile.v1");
    expect(primitives.filename).toBe("my-resume.json");
    expect(warnings).toHaveLength(0);

    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: "application/json" })
    );
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: document.id,
      type: "json_resume",
    });
  });

  it("uses basics.name as document name when name not provided", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const { document } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: repo,
      pdfStorage: pdfStorage(),
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      jsonContent: VALID_JSON_RESUME,
    });

    expect(document.toPrimitives().name).toBe("Jane Smith");
  });

  it("throws on invalid JSON content", async () => {
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      eventBus: eventBus as never,
    });

    await expect(
      useCase.execute({ userId: "user-1", jsonContent: "not json" })
    ).rejects.toThrow(JsonResumeValidationError);
  });

  it("throws when basics.name is missing", async () => {
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      eventBus: eventBus as never,
    });

    await expect(
      useCase.execute({ userId: "user-1", jsonContent: JSON.stringify({ basics: {} }) })
    ).rejects.toThrow(JsonResumeValidationError);
  });

  it("returns warnings for missing sections", async () => {
    const minimalResume = JSON.stringify({ basics: { name: "John" } });
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const { warnings } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      eventBus: eventBus as never,
    }).execute({ userId: "user-1", jsonContent: minimalResume });

    expect(warnings).toContain("No work experience found");
    expect(warnings).toContain("No education found");
    expect(warnings).toContain("No skills found");
  });
});
