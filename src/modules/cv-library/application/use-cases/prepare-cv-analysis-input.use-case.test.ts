import { describe, expect, it, vi } from "vitest";
import { document, documentRepo, tracker } from "./cv-library-test-helpers.test";
import { PrepareCVAnalysisInputUseCase } from "./prepare-cv-analysis-input.use-case";
import type {
  CVPdfStorage,
  CVPdfTextExtractor,
  CVTemplatePdfRenderer,
} from "../../domain/repositories/cv-analysis-preparation-services";

function services() {
  return {
    pdfStorage: {
      download: vi.fn(async () => Buffer.from("pdf")),
      upload: vi.fn(async () => undefined),
      remove: vi.fn(async () => undefined),
    } satisfies CVPdfStorage,
    textExtractor: {
      extract: vi.fn(async () => ({
        textPython: "extracted text",
        textPdfjs: null,
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      })),
    } satisfies CVPdfTextExtractor,
    templateRenderer: {
      render: vi.fn(async () => Buffer.from("template pdf")),
    } satisfies CVTemplatePdfRenderer,
  };
}

describe("PrepareCVAnalysisInputUseCase", () => {
  it("returns existing extraction without side effects when the CV already has text", async () => {
    const repo = documentRepo({
      findById: vi.fn(async () =>
        document({
          extractedText: {
            textPython: "stored text",
            textPdfjs: null,
            textNode: null,
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const deps = services();
    const eventTracker = tracker();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      tracker: eventTracker,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(result?.analysisText).toBe("stored text");
    expect(deps.pdfStorage.download).not.toHaveBeenCalled();
    expect(deps.textExtractor.extract).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(eventTracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "cv_text_extraction",
        status: "success",
        source: "stored_pdf_text",
      }),
    );
  });

  it("extracts and persists uploaded CV text when no stored extraction exists", async () => {
    const cv = document({
      extractedText: {
        textPython: null,
        textPdfjs: null,
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
    });
    const repo = documentRepo({
      findById: vi.fn(async () => cv),
    });
    const deps = services();
    const eventTracker = tracker();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      tracker: eventTracker,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(deps.pdfStorage.download).toHaveBeenCalledWith("user-1/cv-1.pdf");
    expect(deps.textExtractor.extract).toHaveBeenCalledWith(
      Buffer.from("pdf"),
      expect.objectContaining({
        cvId: "cv-1",
        requestId: "req-1",
        pdfStoragePath: "user-1/cv-1.pdf",
      }),
    );
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result?.analysisText).toBe("extracted text");
    expect(result?.extractedText.textPython).toBe("extracted text");
    expect(eventTracker.record).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "cv_library_extraction_updated" }),
    );
  });

  it("renders and parses template CVs without persisting temporary extraction", async () => {
    const repo = documentRepo({
      findById: vi.fn(async () =>
        document({
          type: "template",
          filename: null,
          fileSize: null,
          pdfStoragePath: null,
          templateId: "compact",
          templateLocale: "es",
          profile: {
            basics: { fullName: "Ada Lovelace" },
            experience: [],
            education: [],
            skills: [],
            languages: [],
            projects: [],
            certifications: [],
          },
          extractedText: {
            textPython: null,
            textPdfjs: null,
            textNode: null,
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const deps = services();
    const eventTracker = tracker();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      tracker: eventTracker,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(deps.templateRenderer.render).toHaveBeenCalledOnce();
    expect(deps.pdfStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "user-1/cv-1-req-1-template.pdf",
        contentType: "application/pdf",
        upsert: true,
      }),
    );
    expect(deps.pdfStorage.remove).toHaveBeenCalledWith([
      "user-1/cv-1-req-1-template.pdf",
    ]);
    expect(repo.save).not.toHaveBeenCalled();
    expect(result?.filename).toBe("Original_CV.pdf");
    expect(result?.analysisText).toBe("extracted text");
  });

  it("converts json_resume profile to plain text without PDF extraction", async () => {
    const repo = documentRepo({
      findById: vi.fn(async () =>
        document({
          type: "json_resume",
          profile: {
            basics: { name: "Abraham Mokhtari", headline: "Full Engineer", email: "abraham@gmail.com" },
            summary: "Software developer with experience.",
            experience: [
              { company: "Javelin Group", role: "Senior Engineer", bullets: ["Led team"] },
            ],
          },
          pdfStoragePath: "user-1/cv-1.json",
          extractedText: {
            textPython: null,
            textPdfjs: null,
            textNode: null,
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const deps = services();
    const eventTracker = tracker();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      tracker: eventTracker,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(result?.analysisText).toContain("Abraham Mokhtari");
    expect(result?.analysisText).toContain("Software developer with experience.");
    expect(result?.analysisText).toContain("Javelin Group");
    expect(deps.pdfStorage.download).not.toHaveBeenCalled();
    expect(deps.textExtractor.extract).not.toHaveBeenCalled();
    expect(deps.templateRenderer.render).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(eventTracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "cv_text_extraction",
        status: "success",
        source: "json_resume_profile",
      }),
    );
  });

  it("returns warning when json_resume has no profile data", async () => {
    const repo = documentRepo({
      findById: vi.fn(async () =>
        document({
          type: "json_resume",
          profile: null,
          extractedText: {
            textPython: null,
            textPdfjs: null,
            textNode: null,
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const eventTracker = tracker();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      tracker: eventTracker,
      ...services(),
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(result?.analysisText).toBeNull();
    expect(eventTracker.record).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "cv_text_extraction",
        status: "warning",
        source: "json_resume_profile",
        errorCode: "no_extracted_text_available",
      }),
    );
  });
});
