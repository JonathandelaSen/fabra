import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { JobMatchAnalysisCreatedEvent } from "../events/job-match-analysis-created.event";
import { JobMatchAnalysisJobUrlUpdatedEvent } from "../events/job-match-analysis-job-url-updated.event";
import { JobMatchAnalysisScoredEvent } from "../events/job-match-analysis-scored.event";
import { JobMatchAnalysisId } from "../value-objects/job-match-analysis-id.value-object";

export interface JobMatchAnalysisExtractedTextPrimitives {
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

export interface JobMatchAnalysisPrimitives {
  id: string;
  userId: string;
  cvDocumentId: string | null;
  cvStructuredProfileId: string | null;
  jobOpportunityId: string | null;
  title: string;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: JobMatchAnalysisExtractedTextPrimitives;
  aiModel: string | null;
  score: number | null;
  feedback: string | null;
  aiKeywords: string[];
  improvements: string[];
  jobSnapshot: unknown | null;
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  analyzedAt: string | null;
  legacyAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobMatchAnalysisCreateParams {
  id: JobMatchAnalysisId;
  userId: UserIdType;
  cvDocumentId: string | null;
  cvStructuredProfileId: string | null;
  jobOpportunityId: string | null;
  title: string;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: JobMatchAnalysisExtractedTextPrimitives;
  aiModel: string | null;
  score: number | null;
  feedback: string | null;
  aiKeywords: string[];
  improvements: string[];
  jobSnapshot: unknown | null;
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  analyzedAt: string | null;
  legacyAnalysisId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class JobMatchAnalysis extends AggregateRoot {
  private constructor(
    private readonly analysisId: JobMatchAnalysisId,
    private readonly ownerId: UserIdType,
    private readonly analysisCvDocumentId: string | null,
    private readonly analysisCvStructuredProfileId: string | null,
    private readonly analysisJobOpportunityId: string | null,
    private readonly analysisTitle: string,
    private readonly analysisFilename: string,
    private readonly analysisFileSize: number | null,
    private readonly analysisPdfStoragePath: string | null,
    private readonly analysisExtractedText: JobMatchAnalysisExtractedTextPrimitives,
    private analysisAIModel: string | null,
    private analysisScore: number | null,
    private analysisFeedback: string | null,
    private analysisAIKeywords: string[],
    private analysisImprovements: string[],
    private analysisJobSnapshot: unknown | null,
    private analysisJobKeywords: string[],
    private analysisCVKeywords: string[],
    private analysisMatchingKeywords: string[],
    private analysisMissingKeywords: string[],
    private analysisAnalyzedAt: string | null,
    private readonly analysisLegacyAnalysisId: string | null,
    private readonly analysisCreatedAt: Timestamp,
    private analysisUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: JobMatchAnalysisCreateParams): JobMatchAnalysis {
    const analysis = new JobMatchAnalysis(
      params.id,
      params.userId,
      params.cvDocumentId,
      params.cvStructuredProfileId,
      params.jobOpportunityId,
      params.title,
      params.filename,
      params.fileSize,
      params.pdfStoragePath,
      params.extractedText,
      params.aiModel,
      params.score,
      params.feedback,
      params.aiKeywords,
      params.improvements,
      params.jobSnapshot,
      params.jobKeywords,
      params.cvKeywords,
      params.matchingKeywords,
      params.missingKeywords,
      params.analyzedAt,
      params.legacyAnalysisId,
      params.createdAt,
      params.updatedAt
    );
    analysis.recordDomainEvent(new JobMatchAnalysisCreatedEvent(analysis.id));
    return analysis;
  }

  static fromPrimitives(primitives: JobMatchAnalysisPrimitives): JobMatchAnalysis {
    return new JobMatchAnalysis(
      JobMatchAnalysisId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      primitives.cvDocumentId,
      primitives.cvStructuredProfileId,
      primitives.jobOpportunityId,
      primitives.title,
      primitives.filename,
      primitives.fileSize,
      primitives.pdfStoragePath,
      primitives.extractedText,
      primitives.aiModel,
      primitives.score,
      primitives.feedback,
      primitives.aiKeywords,
      primitives.improvements,
      primitives.jobSnapshot,
      primitives.jobKeywords,
      primitives.cvKeywords,
      primitives.matchingKeywords,
      primitives.missingKeywords,
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
    aiKeywords: string[];
    improvements: string[];
    jobSnapshot: unknown | null;
    jobKeywords: string[];
    cvKeywords: string[];
    matchingKeywords: string[];
    missingKeywords: string[];
    analyzedAt: string;
    updatedAt: string;
  }): void {
    this.analysisAIModel = input.aiModel;
    this.analysisScore = input.score;
    this.analysisFeedback = input.feedback;
    this.analysisAIKeywords = input.aiKeywords;
    this.analysisImprovements = input.improvements;
    this.analysisJobSnapshot = input.jobSnapshot;
    this.analysisJobKeywords = input.jobKeywords;
    this.analysisCVKeywords = input.cvKeywords;
    this.analysisMatchingKeywords = input.matchingKeywords;
    this.analysisMissingKeywords = input.missingKeywords;
    this.analysisAnalyzedAt = input.analyzedAt;
    this.analysisUpdatedAt = Timestamp.fromPrimitives(input.updatedAt);
    this.recordDomainEvent(new JobMatchAnalysisScoredEvent(this.id, input.score, input.aiModel));
  }

  updateJobUrl(jobUrl: string | null, updatedAt: string): void {
    const snapshot =
      this.analysisJobSnapshot && typeof this.analysisJobSnapshot === "object"
        ? { ...(this.analysisJobSnapshot as Record<string, unknown>) }
        : {};
    this.analysisJobSnapshot = { ...snapshot, url: jobUrl };
    this.analysisUpdatedAt = Timestamp.fromPrimitives(updatedAt);
    this.recordDomainEvent(new JobMatchAnalysisJobUrlUpdatedEvent(this.id, jobUrl));
  }

  toPrimitives(): JobMatchAnalysisPrimitives {
    return {
      id: this.id,
      userId: this.ownerId.toPrimitives(),
      cvDocumentId: this.analysisCvDocumentId,
      cvStructuredProfileId: this.analysisCvStructuredProfileId,
      jobOpportunityId: this.analysisJobOpportunityId,
      title: this.analysisTitle,
      filename: this.analysisFilename,
      fileSize: this.analysisFileSize,
      pdfStoragePath: this.analysisPdfStoragePath,
      extractedText: this.analysisExtractedText,
      aiModel: this.analysisAIModel,
      score: this.analysisScore,
      feedback: this.analysisFeedback,
      aiKeywords: this.analysisAIKeywords,
      improvements: this.analysisImprovements,
      jobSnapshot: this.analysisJobSnapshot,
      jobKeywords: this.analysisJobKeywords,
      cvKeywords: this.analysisCVKeywords,
      matchingKeywords: this.analysisMatchingKeywords,
      missingKeywords: this.analysisMissingKeywords,
      analyzedAt: this.analysisAnalyzedAt,
      legacyAnalysisId: this.analysisLegacyAnalysisId,
      createdAt: this.analysisCreatedAt.toPrimitives(),
      updatedAt: this.analysisUpdatedAt.toPrimitives(),
    };
  }
}
