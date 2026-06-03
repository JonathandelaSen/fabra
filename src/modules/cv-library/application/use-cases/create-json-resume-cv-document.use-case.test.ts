import { describe, expect, it, vi } from "vitest";
import { documentRepo, tracker } from "./cv-library-test-helpers.test";
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
  it("creates a json_resume document with mapped profile", async () => {
    const repo = documentRepo();
    const events = tracker();
    const storage = pdfStorage();

    const { document, warnings } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: repo,
      pdfStorage: storage,
      tracker: events,
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
    expect(events.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "cv_library_document_created",
        metadata: { type: "json_resume" },
      })
    );
  });

  it("uses basics.name as document name when name not provided", async () => {
    const repo = documentRepo();
    const { document } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: repo,
      pdfStorage: pdfStorage(),
      tracker: tracker(),
    }).execute({
      userId: "user-1",
      jsonContent: VALID_JSON_RESUME,
    });

    expect(document.toPrimitives().name).toBe("Jane Smith");
  });

  it("throws on invalid JSON content", async () => {
    const useCase = new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      tracker: tracker(),
    });

    await expect(
      useCase.execute({ userId: "user-1", jsonContent: "not json" })
    ).rejects.toThrow(JsonResumeValidationError);
  });

  it("throws when basics.name is missing", async () => {
    const useCase = new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      tracker: tracker(),
    });

    await expect(
      useCase.execute({ userId: "user-1", jsonContent: JSON.stringify({ basics: {} }) })
    ).rejects.toThrow(JsonResumeValidationError);
  });

  it("returns warnings for missing sections", async () => {
    const minimalResume = JSON.stringify({ basics: { name: "John" } });
    const { warnings } = await new CreateJsonResumeCVDocumentUseCase({
      documentRepo: documentRepo(),
      pdfStorage: pdfStorage(),
      tracker: tracker(),
    }).execute({ userId: "user-1", jsonContent: minimalResume });

    expect(warnings).toContain("No work experience found");
    expect(warnings).toContain("No education found");
    expect(warnings).toContain("No skills found");
  });
});
