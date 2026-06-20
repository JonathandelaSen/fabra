import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { CVAnalysisCreatedEvent } from "../events/cv-analysis-created.event";
import { CVAnalysisScoredEvent } from "../events/cv-analysis-scored.event";
import { CVAnalysisDetails } from "../value-objects/cv-analysis-details.value-object";
import { CVAnalysisId } from "../value-objects/cv-analysis-id.value-object";

export interface CVAnalysisExtractedTextPrimitives {
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export interface CVAnalysisPrimitives {
  id: string;
  userId: string;
  cvDocumentId: string | null;
  cvStructuredProfileId: string | null;
  title: string;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: CVAnalysisExtractedTextPrimitives;
  aiModel: string | null;
  score: number | null;
  feedback: string | null;
  keywords: string[];
  improvements: string[];
  aiContext: unknown | null;
  analyzedAt: string | null;
  legacyAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CVAnalysisCreateParams {
  id: CVAnalysisId;
  userId: UserIdType;
  cvDocumentId: string | null;
  cvStructuredProfileId: string | null;
  title: string;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: CVAnalysisExtractedTextPrimitives;
  aiModel: string | null;
  score: number | null;
  feedback: string | null;
  keywords: string[];
  improvements: string[];
  aiContext: unknown | null;
  analyzedAt: string | null;
  legacyAnalysisId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CVAnalysis extends AggregateRoot {
  private constructor(
    private readonly analysisId: CVAnalysisId,
    private readonly ownerId: UserIdType,
    private analysisDetails: CVAnalysisDetails,
    private readonly analysisCreatedAt: Timestamp,
    private analysisUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: CVAnalysisCreateParams): CVAnalysis {
    const analysis = new CVAnalysis(
      params.id,
      params.userId,
      CVAnalysisDetails.fromPrimitives({
        cvDocumentId: params.cvDocumentId,
        cvStructuredProfileId: params.cvStructuredProfileId,
        title: params.title,
        filename: params.filename,
        fileSize: params.fileSize,
        pdfStoragePath: params.pdfStoragePath,
        extractedText: params.extractedText,
        aiModel: params.aiModel,
        score: params.score,
        feedback: params.feedback,
        keywords: params.keywords,
        improvements: params.improvements,
        aiContext: params.aiContext,
        analyzedAt: params.analyzedAt,
        legacyAnalysisId: params.legacyAnalysisId,
      }),
      params.createdAt,
      params.updatedAt
    );
    analysis.recordDomainEvent(new CVAnalysisCreatedEvent(analysis.id));
    return analysis;
  }

  static fromPrimitives(primitives: CVAnalysisPrimitives): CVAnalysis {
    return new CVAnalysis(
      CVAnalysisId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      CVAnalysisDetails.fromPrimitives({
        cvDocumentId: primitives.cvDocumentId,
        cvStructuredProfileId: primitives.cvStructuredProfileId,
        title: primitives.title,
        filename: primitives.filename,
        fileSize: primitives.fileSize,
        pdfStoragePath: primitives.pdfStoragePath,
        extractedText: primitives.extractedText,
        aiModel: primitives.aiModel,
        score: primitives.score,
        feedback: primitives.feedback,
        keywords: primitives.keywords,
        improvements: primitives.improvements,
        aiContext: primitives.aiContext,
        analyzedAt: primitives.analyzedAt,
        legacyAnalysisId: primitives.legacyAnalysisId,
      }),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt)
    );
  }

  get id(): string {
    return this.analysisId.toPrimitives();
  }

  applyAIResult(input: {
    aiModel: string;
    score: number;
    feedback: string;
    keywords: string[];
    improvements: string[];
    aiContext: unknown | null;
    analyzedAt: string;
    updatedAt: string;
  }): void {
    this.analysisDetails = this.analysisDetails.withAIResult(input);
    this.analysisUpdatedAt = Timestamp.fromPrimitives(input.updatedAt);
    this.recordDomainEvent(new CVAnalysisScoredEvent(this.id, input.score, input.aiModel));
  }

  toPrimitives(): CVAnalysisPrimitives {
    return {
      id: this.analysisId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      cvDocumentId: this.analysisDetails.toPrimitives().cvDocumentId,
      cvStructuredProfileId: this.analysisDetails.toPrimitives().cvStructuredProfileId,
      title: this.analysisDetails.toPrimitives().title,
      filename: this.analysisDetails.toPrimitives().filename,
      fileSize: this.analysisDetails.toPrimitives().fileSize,
      pdfStoragePath: this.analysisDetails.toPrimitives().pdfStoragePath,
      extractedText: this.analysisDetails.toPrimitives().extractedText,
      aiModel: this.analysisDetails.toPrimitives().aiModel,
      score: this.analysisDetails.toPrimitives().score,
      feedback: this.analysisDetails.toPrimitives().feedback,
      keywords: this.analysisDetails.toPrimitives().keywords,
      improvements: this.analysisDetails.toPrimitives().improvements,
      aiContext: this.analysisDetails.toPrimitives().aiContext,
      analyzedAt: this.analysisDetails.toPrimitives().analyzedAt,
      legacyAnalysisId: this.analysisDetails.toPrimitives().legacyAnalysisId,
      createdAt: this.analysisCreatedAt.toPrimitives(),
      updatedAt: this.analysisUpdatedAt.toPrimitives(),
    };
  }
}
