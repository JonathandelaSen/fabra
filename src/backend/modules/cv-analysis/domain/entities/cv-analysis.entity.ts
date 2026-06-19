import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { CVAnalysisCreatedEvent } from "../events/cv-analysis-created.event";
import { CVAnalysisScoredEvent } from "../events/cv-analysis-scored.event";
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
    private readonly analysisCvDocumentId: string | null,
    private readonly analysisCvStructuredProfileId: string | null,
    private readonly analysisTitle: string,
    private readonly analysisFilename: string,
    private readonly analysisFileSize: number | null,
    private readonly analysisPdfStoragePath: string | null,
    private readonly analysisExtractedText: CVAnalysisExtractedTextPrimitives,
    private analysisAIModel: string | null,
    private analysisScore: number | null,
    private analysisFeedback: string | null,
    private analysisKeywords: string[],
    private analysisImprovements: string[],
    private analysisAIContext: unknown | null,
    private analysisAnalyzedAt: string | null,
    private readonly analysisLegacyAnalysisId: string | null,
    private readonly analysisCreatedAt: Timestamp,
    private analysisUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: CVAnalysisCreateParams): CVAnalysis {
    const analysis = new CVAnalysis(
      params.id,
      params.userId,
      params.cvDocumentId,
      params.cvStructuredProfileId,
      params.title,
      params.filename,
      params.fileSize,
      params.pdfStoragePath,
      params.extractedText,
      params.aiModel,
      params.score,
      params.feedback,
      params.keywords,
      params.improvements,
      params.aiContext,
      params.analyzedAt,
      params.legacyAnalysisId,
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
      primitives.cvDocumentId,
      primitives.cvStructuredProfileId,
      primitives.title,
      primitives.filename,
      primitives.fileSize,
      primitives.pdfStoragePath,
      primitives.extractedText,
      primitives.aiModel,
      primitives.score,
      primitives.feedback,
      primitives.keywords,
      primitives.improvements,
      primitives.aiContext,
      primitives.analyzedAt,
      primitives.legacyAnalysisId,
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
    this.analysisAIModel = input.aiModel;
    this.analysisScore = input.score;
    this.analysisFeedback = input.feedback;
    this.analysisKeywords = input.keywords;
    this.analysisImprovements = input.improvements;
    this.analysisAIContext = input.aiContext;
    this.analysisAnalyzedAt = input.analyzedAt;
    this.analysisUpdatedAt = Timestamp.fromPrimitives(input.updatedAt);
    this.recordDomainEvent(new CVAnalysisScoredEvent(this.id, input.score, input.aiModel));
  }

  toPrimitives(): CVAnalysisPrimitives {
    return {
      id: this.id,
      userId: this.ownerId.toPrimitives(),
      cvDocumentId: this.analysisCvDocumentId,
      cvStructuredProfileId: this.analysisCvStructuredProfileId,
      title: this.analysisTitle,
      filename: this.analysisFilename,
      fileSize: this.analysisFileSize,
      pdfStoragePath: this.analysisPdfStoragePath,
      extractedText: this.analysisExtractedText,
      aiModel: this.analysisAIModel,
      score: this.analysisScore,
      feedback: this.analysisFeedback,
      keywords: this.analysisKeywords,
      improvements: this.analysisImprovements,
      aiContext: this.analysisAIContext,
      analyzedAt: this.analysisAnalyzedAt,
      legacyAnalysisId: this.analysisLegacyAnalysisId,
      createdAt: this.analysisCreatedAt.toPrimitives(),
      updatedAt: this.analysisUpdatedAt.toPrimitives(),
    };
  }
}
