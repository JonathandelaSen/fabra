import { describe, expect, it, vi } from "vitest";
import { document, documentRepo, eventBus } from "./cv-library-test-helpers.test";
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
        textPython: "extracted text" as string | null,
        textPdfjs: null as string | null,
        textNode: null as string | null,
        extractErrorPython: null as string | null,
        extractErrorPdfjs: null as string | null,
        extractErrorNode: null as string | null,
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
            textPdfjs: "stored pdfjs text",
            textNode: "stored node text",
            extractErrorPython: null,
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const deps = services();
    const bus = eventBus();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
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
    expect(bus.publish).not.toHaveBeenCalled();
  });

  it("retries uploaded CV extraction when one parser result is missing", async () => {
    const cv = document({
      extractedText: {
        textPython: "stored python text",
        textPdfjs: "stored pdfjs text",
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
    deps.textExtractor.extract = vi.fn(async () => ({
      textPython: "repaired python text",
      textPdfjs: "repaired pdfjs text",
      textNode: "repaired node text",
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    }));

    const bus = eventBus();
    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(deps.pdfStorage.download).toHaveBeenCalledWith("user-1/cv-1.pdf");
    expect(deps.textExtractor.extract).toHaveBeenCalledOnce();
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result?.extractedText.textNode).toBe("repaired node text");
  });

  it("does not propagate stale parser errors after retrying extraction", async () => {
    const repo = documentRepo({
      findById: vi.fn(async () =>
        document({
          extractedText: {
            textPython: null,
            textPdfjs: "stored pdfjs text",
            textNode: null,
            extractErrorPython:
              "Supabase storage credentials are not configured.",
            extractErrorPdfjs: null,
            extractErrorNode: null,
          },
        }),
      ),
    });
    const deps = services();

    const bus = eventBus();
    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(result?.analysisText).toBe("extracted text");
    expect(result?.extractedText.extractErrorPython).toBeNull();
    expect(result?.extractionDiagnostics.pythonError).toBe(false);
    expect(deps.pdfStorage.download).toHaveBeenCalledWith("user-1/cv-1.pdf");
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("retries and persists uploaded CV extraction when stored text has parser errors", async () => {
    const cv = document({
      extractedText: {
        textPython: null,
        textPdfjs: "stored pdfjs text",
        textNode: null,
        extractErrorPython:
          "Supabase storage credentials are not configured.",
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
    });
    const repo = documentRepo({
      findById: vi.fn(async () => cv),
    });
    const deps = services();
    deps.textExtractor.extract = vi.fn(async () => ({
      textPython: "repaired python text",
      textPdfjs: "repaired pdfjs text",
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    }));

    const bus = eventBus();
    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
      ...deps,
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(deps.pdfStorage.download).toHaveBeenCalledWith("user-1/cv-1.pdf");
    expect(deps.textExtractor.extract).toHaveBeenCalledOnce();
    expect(repo.save).toHaveBeenCalledOnce();
    expect(result?.analysisText).toBe("repaired python text");
    expect(result?.extractedText.extractErrorPython).toBeNull();
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
    const bus = eventBus();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
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
    expect(bus.publish).toHaveBeenCalledWith([
      expect.objectContaining({ eventName: "cv_document_extracted_text_updated" }),
    ]);
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
    const bus = eventBus();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
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
    expect(bus.publish).not.toHaveBeenCalled();
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
    const bus = eventBus();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
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
    expect(bus.publish).not.toHaveBeenCalled();
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
    const bus = eventBus();

    const result = await new PrepareCVAnalysisInputUseCase({
      documentRepo: repo,
      eventBus: bus,
      ...services(),
    }).execute({
      cvId: "cv-1",
      userId: "user-1",
      requestId: "req-1",
      source: "test",
    });

    expect(result?.analysisText).toBeNull();
    expect(bus.publish).not.toHaveBeenCalled();
  });
});
