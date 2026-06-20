import { hasExtractedText, sanitizeErrorMessage } from "@/lib/observability";
import {
  getBestCVText,
  profileToPlainText,
  type StandardCVProfile,
} from "../../domain/cv-profile";
import {
  getCVTemplate,
  type CVTemplateId,
  type CVTemplateLocale,
} from "../../domain/cv-templates";
import { CV_PDFS_BUCKET } from "../../domain/services/cv-storage";
import type {
  CVDocument,
  CVDocumentPrimitives,
} from "../../domain/entities/cv-document.entity";
import type { CVDocumentExtractedTextPrimitives } from "../../domain/value-objects/cv-document-extracted-text.value-object";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import type {
  CVPdfStorage,
  CVPdfTextExtractor,
  CVTemplatePdfRenderer,
} from "../../domain/repositories/cv-analysis-preparation-services";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVAnalysisInput } from "../../domain/value-objects/cv-analysis-input.value-object";
import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";

export interface PrepareCVAnalysisInputInput {
  cvId: string;
  userId: string;
  requestId: string;
  source: string;
}

type TemplateExtraction = {
  extracted: CVDocumentExtractedTextPrimitives;
  filename: string;
  fileSize: number;
};

export class PrepareCVAnalysisInputUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      pdfStorage: CVPdfStorage;
      textExtractor: CVPdfTextExtractor;
      templateRenderer: CVTemplatePdfRenderer;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: PrepareCVAnalysisInputInput,
  ): Promise<CVAnalysisInput | null> {
    let cv = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.cvId),
      UserId.fromPrimitives(input.userId),
    );
    if (!cv) return null;

    if (cv.typeValue.isJsonResume()) {
      return this.prepareJsonResumeResult(cv, input);
    }

    cv = await this.ensureUploadedCVExtraction({ ...input, cv });

    const cvPrimitives = cv.toPrimitives();
    const templatePdfExtraction =
      cv.typeValue.isTemplate()
        ? await this.extractTemplateCVPdf({ ...input, cv: cvPrimitives })
        : null;
    const analysisExtraction =
      templatePdfExtraction?.extracted ?? cvPrimitives.extractedText;
    const analysisText = getBestCVText({
      text_python: analysisExtraction.textPython,
      text_pdfjs: analysisExtraction.textPdfjs,
      text_node: analysisExtraction.textNode,
    });
    const responseExtraction = analysisText
      ? this.clearParserErrors(analysisExtraction)
      : analysisExtraction;



    return CVAnalysisInput.fromPrimitives({
      cv: cvPrimitives,
      analysisText,
      filename: templatePdfExtraction?.filename ?? cvPrimitives.filename ?? "",
      fileSize: templatePdfExtraction?.fileSize ?? cvPrimitives.fileSize,
      pdfStoragePath: cvPrimitives.pdfStoragePath,
      extractedText: responseExtraction,
      extractionDiagnostics: {
        filename: templatePdfExtraction?.filename ?? cvPrimitives.filename,
        fileSize: templatePdfExtraction?.fileSize ?? cvPrimitives.fileSize,
        pythonLength: responseExtraction.textPython?.length ?? 0,
        pdfjsLength: responseExtraction.textPdfjs?.length ?? 0,
        nodeLength: responseExtraction.textNode?.length ?? 0,
        pythonError: Boolean(responseExtraction.extractErrorPython),
        pdfjsError: Boolean(responseExtraction.extractErrorPdfjs),
        nodeError: Boolean(responseExtraction.extractErrorNode),
      },
    });
  }

  private clearParserErrors(
    extracted: CVDocumentExtractedTextPrimitives,
  ): CVDocumentExtractedTextPrimitives {
    return {
      ...extracted,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    };
  }

  private async prepareJsonResumeResult(
    cv: CVDocument,
    input: PrepareCVAnalysisInputInput,
  ): Promise<CVAnalysisInput> {
    const primitives = cv.toPrimitives();
    const analysisText = profileToPlainText(
      primitives.profile as StandardCVProfile | null,
    );
    const emptyExtraction: CVDocumentExtractedTextPrimitives = {
      textPython: null,
      textPdfjs: null,
      textNode: analysisText,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    };



    return CVAnalysisInput.fromPrimitives({
      cv: primitives,
      analysisText,
      filename: primitives.filename ?? "resume.json",
      fileSize: primitives.fileSize,
      pdfStoragePath: primitives.pdfStoragePath,
      extractedText: emptyExtraction,
      extractionDiagnostics: {
        filename: primitives.filename,
        fileSize: primitives.fileSize,
        pythonLength: 0,
        pdfjsLength: 0,
        nodeLength: analysisText?.length ?? 0,
        pythonError: false,
        pdfjsError: false,
        nodeError: false,
      },
    });
  }

  private async ensureUploadedCVExtraction(input: {
    cv: CVDocument;
    userId: string;
    requestId: string;
  }): Promise<CVDocument> {
    const primitives = input.cv.toPrimitives();
    if (!primitives.pdfStoragePath) {
      return input.cv;
    }

    const storedExtractionHasText = hasExtractedText([
      primitives.extractedText.textPython,
      primitives.extractedText.textPdfjs,
      primitives.extractedText.textNode,
    ]);
    const storedExtractionIsComplete = this.hasAllParserText(
      primitives.extractedText,
    );
    const storedExtractionHasErrors = this.hasParserErrors(
      primitives.extractedText,
    );
    if (
      storedExtractionHasText &&
      storedExtractionIsComplete &&
      !storedExtractionHasErrors
    ) {
      return input.cv;
    }

    const pdfBuffer = await this.deps.pdfStorage.download(
      primitives.pdfStoragePath,
    );
    const extracted = await this.deps.textExtractor.extract(pdfBuffer, {
      userId: input.userId,
      cvId: primitives.id,
      requestId: input.requestId,
      fileSize: primitives.fileSize,
      filename: primitives.filename,
      pdfStoragePath: primitives.pdfStoragePath,
    });

    input.cv.updateExtractedText(
      extracted,
      Timestamp.fromPrimitives(new Date().toISOString()),
    );
    const saved = await this.deps.documentRepo.save(input.cv);
    const events = input.cv.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    return saved;
  }

  private hasParserErrors(
    extracted: CVDocumentExtractedTextPrimitives,
  ): boolean {
    return Boolean(
      extracted.extractErrorPython ||
        extracted.extractErrorPdfjs ||
        extracted.extractErrorNode,
    );
  }

  private hasAllParserText(
    extracted: CVDocumentExtractedTextPrimitives,
  ): boolean {
    return hasExtractedText([extracted.textPython]) &&
      hasExtractedText([extracted.textPdfjs]) &&
      hasExtractedText([extracted.textNode]);
  }

  private getTemplateAnalysisFilename(cv: CVDocumentPrimitives) {
    const baseName = cv.name.replace(/[^a-zA-Z0-9_-]/g, "_") || "template-cv";
    return `${baseName}.pdf`;
  }

  private async extractTemplateCVPdf(input: {
    cv: CVDocumentPrimitives;
    userId: string;
    requestId: string;
    source: string;
  }): Promise<TemplateExtraction> {
    if (!input.cv.profile || !input.cv.templateId) {
      throw new Error("Template CV has no profile or template.");
    }

    const template = getCVTemplate(input.cv.templateId);
    if (!template) {
      throw new Error("Template not found.");
    }

    const filename = this.getTemplateAnalysisFilename(input.cv);
    const renderStartedAt = performance.now();


    const templatePdfBuffer = await this.deps.templateRenderer.render({
      profile: input.cv.profile as StandardCVProfile,
      templateId: template.templateId as CVTemplateId,
      locale: (input.cv.templateLocale ?? "es") as CVTemplateLocale,
    });



    const pdfStoragePath = `${input.userId}/${input.cv.id}-${input.requestId}-template.pdf`;
    const storageStartedAt = performance.now();


    try {
      await this.deps.pdfStorage.upload({
        path: pdfStoragePath,
        buffer: templatePdfBuffer,
        contentType: "application/pdf",
        upsert: true,
      });
    } catch (error: unknown) {
      throw error;
    }



    try {
      const extracted = await this.deps.textExtractor.extract(
        templatePdfBuffer,
        {
          userId: input.userId,
          cvId: input.cv.id,
          requestId: input.requestId,
          fileSize: templatePdfBuffer.length,
          filename,
          pdfStoragePath,
        },
      );

      return {
        extracted: extracted.toPrimitives(),
        filename,
        fileSize: templatePdfBuffer.length,
      };
    } finally {
      await this.deps.pdfStorage.remove([pdfStoragePath]).catch(() => {});
    }
  }
}
