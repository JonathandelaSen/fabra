import {
  AggregateRoot,
  LongText,
  StringList,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { JobMatchAnalysisCreatedEvent } from "../events/job-match-analysis-created.event";
import { JobMatchAnalysisJobUrlUpdatedEvent } from "../events/job-match-analysis-job-url-updated.event";
import { JobMatchAnalysisScoredEvent } from "../events/job-match-analysis-scored.event";
import {
  JobMatchAnalysisExtractedText,
  type JobMatchAnalysisExtractedTextPrimitives,
} from "../value-objects/job-match-analysis-extracted-text.value-object";
import { JobMatchAnalysisId } from "../value-objects/job-match-analysis-id.value-object";
import { JobMatchAnalysisOptionalCounter } from "../value-objects/job-match-analysis-optional-counter.value-object";
import { JobMatchAnalysisOptionalText } from "../value-objects/job-match-analysis-optional-text.value-object";
import { JobMatchAnalysisOptionalTimestamp } from "../value-objects/job-match-analysis-optional-timestamp.value-object";
import { JobMatchAnalysisSnapshot } from "../value-objects/job-match-analysis-snapshot.value-object";

export type { JobMatchAnalysisExtractedTextPrimitives };

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
    private readonly analysisCvDocumentId: JobMatchAnalysisOptionalText,
    private readonly analysisCvStructuredProfileId: JobMatchAnalysisOptionalText,
    private readonly analysisJobOpportunityId: JobMatchAnalysisOptionalText,
    private readonly analysisTitle: LongText,
    private readonly analysisFilename: LongText,
    private readonly analysisFileSize: JobMatchAnalysisOptionalCounter,
    private readonly analysisPdfStoragePath: JobMatchAnalysisOptionalText,
    private readonly analysisExtractedText: JobMatchAnalysisExtractedText,
    private analysisAIModel: JobMatchAnalysisOptionalText,
    private analysisScore: JobMatchAnalysisOptionalCounter,
    private analysisFeedback: JobMatchAnalysisOptionalText,
    private analysisAIKeywords: StringList,
    private analysisImprovements: StringList,
    private analysisJobSnapshot: JobMatchAnalysisSnapshot,
    private analysisJobKeywords: StringList,
    private analysisCVKeywords: StringList,
    private analysisMatchingKeywords: StringList,
    private analysisMissingKeywords: StringList,
    private analysisAnalyzedAt: JobMatchAnalysisOptionalTimestamp,
    private readonly analysisLegacyAnalysisId: JobMatchAnalysisOptionalText,
    private readonly analysisCreatedAt: Timestamp,
    private analysisUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: JobMatchAnalysisCreateParams): JobMatchAnalysis {
    const analysis = new JobMatchAnalysis(
      params.id,
      params.userId,
      JobMatchAnalysisOptionalText.fromPrimitives(params.cvDocumentId),
      JobMatchAnalysisOptionalText.fromPrimitives(params.cvStructuredProfileId),
      JobMatchAnalysisOptionalText.fromPrimitives(params.jobOpportunityId),
      LongText.fromPrimitives(params.title),
      LongText.fromPrimitives(params.filename),
      JobMatchAnalysisOptionalCounter.fromPrimitives(params.fileSize),
      JobMatchAnalysisOptionalText.fromPrimitives(params.pdfStoragePath),
      JobMatchAnalysisExtractedText.fromPrimitives(params.extractedText),
      JobMatchAnalysisOptionalText.fromPrimitives(params.aiModel),
      JobMatchAnalysisOptionalCounter.fromPrimitives(params.score),
      JobMatchAnalysisOptionalText.fromPrimitives(params.feedback),
      StringList.fromPrimitives(params.aiKeywords),
      StringList.fromPrimitives(params.improvements),
      JobMatchAnalysisSnapshot.fromPrimitives(params.jobSnapshot),
      StringList.fromPrimitives(params.jobKeywords),
      StringList.fromPrimitives(params.cvKeywords),
      StringList.fromPrimitives(params.matchingKeywords),
      StringList.fromPrimitives(params.missingKeywords),
      JobMatchAnalysisOptionalTimestamp.fromPrimitives(params.analyzedAt),
      JobMatchAnalysisOptionalText.fromPrimitives(params.legacyAnalysisId),
      params.createdAt,
      params.updatedAt,
    );
    analysis.recordDomainEvent(new JobMatchAnalysisCreatedEvent(analysis.id));
    return analysis;
  }

  static fromPrimitives(
    primitives: JobMatchAnalysisPrimitives,
  ): JobMatchAnalysis {
    return new JobMatchAnalysis(
      JobMatchAnalysisId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.cvDocumentId),
      JobMatchAnalysisOptionalText.fromPrimitives(
        primitives.cvStructuredProfileId,
      ),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.jobOpportunityId),
      LongText.fromPrimitives(primitives.title),
      LongText.fromPrimitives(primitives.filename),
      JobMatchAnalysisOptionalCounter.fromPrimitives(primitives.fileSize),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.pdfStoragePath),
      JobMatchAnalysisExtractedText.fromPrimitives(primitives.extractedText),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.aiModel),
      JobMatchAnalysisOptionalCounter.fromPrimitives(primitives.score),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.feedback),
      StringList.fromPrimitives(primitives.aiKeywords),
      StringList.fromPrimitives(primitives.improvements),
      JobMatchAnalysisSnapshot.fromPrimitives(primitives.jobSnapshot),
      StringList.fromPrimitives(primitives.jobKeywords),
      StringList.fromPrimitives(primitives.cvKeywords),
      StringList.fromPrimitives(primitives.matchingKeywords),
      StringList.fromPrimitives(primitives.missingKeywords),
      JobMatchAnalysisOptionalTimestamp.fromPrimitives(primitives.analyzedAt),
      JobMatchAnalysisOptionalText.fromPrimitives(primitives.legacyAnalysisId),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
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
    this.analysisAIModel = JobMatchAnalysisOptionalText.fromPrimitives(
      input.aiModel,
    );
    this.analysisScore = JobMatchAnalysisOptionalCounter.fromPrimitives(
      input.score,
    );
    this.analysisFeedback = JobMatchAnalysisOptionalText.fromPrimitives(
      input.feedback,
    );
    this.analysisAIKeywords = StringList.fromPrimitives(input.aiKeywords);
    this.analysisImprovements = StringList.fromPrimitives(input.improvements);
    this.analysisJobSnapshot = JobMatchAnalysisSnapshot.fromPrimitives(
      input.jobSnapshot,
    );
    this.analysisJobKeywords = StringList.fromPrimitives(input.jobKeywords);
    this.analysisCVKeywords = StringList.fromPrimitives(input.cvKeywords);
    this.analysisMatchingKeywords = StringList.fromPrimitives(
      input.matchingKeywords,
    );
    this.analysisMissingKeywords = StringList.fromPrimitives(
      input.missingKeywords,
    );
    this.analysisAnalyzedAt = JobMatchAnalysisOptionalTimestamp.fromPrimitives(
      input.analyzedAt,
    );
    this.analysisUpdatedAt = Timestamp.fromPrimitives(input.updatedAt);
    this.recordDomainEvent(
      new JobMatchAnalysisScoredEvent(this.id, input.score, input.aiModel),
    );
  }

  updateJobUrl(jobUrl: string | null, updatedAt: string): void {
    this.analysisJobSnapshot = this.analysisJobSnapshot.withJobUrl(jobUrl);
    this.analysisUpdatedAt = Timestamp.fromPrimitives(updatedAt);
    this.recordDomainEvent(
      new JobMatchAnalysisJobUrlUpdatedEvent(this.id, jobUrl),
    );
  }

  toPrimitives(): JobMatchAnalysisPrimitives {
    return {
      id: this.analysisId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      cvDocumentId: this.analysisCvDocumentId.toPrimitives(),
      cvStructuredProfileId: this.analysisCvStructuredProfileId.toPrimitives(),
      jobOpportunityId: this.analysisJobOpportunityId.toPrimitives(),
      title: this.analysisTitle.toPrimitives(),
      filename: this.analysisFilename.toPrimitives(),
      fileSize: this.analysisFileSize.toPrimitives(),
      pdfStoragePath: this.analysisPdfStoragePath.toPrimitives(),
      extractedText: this.analysisExtractedText.toPrimitives(),
      aiModel: this.analysisAIModel.toPrimitives(),
      score: this.analysisScore.toPrimitives(),
      feedback: this.analysisFeedback.toPrimitives(),
      aiKeywords: this.analysisAIKeywords.toPrimitives(),
      improvements: this.analysisImprovements.toPrimitives(),
      jobSnapshot: this.analysisJobSnapshot.toPrimitives(),
      jobKeywords: this.analysisJobKeywords.toPrimitives(),
      cvKeywords: this.analysisCVKeywords.toPrimitives(),
      matchingKeywords: this.analysisMatchingKeywords.toPrimitives(),
      missingKeywords: this.analysisMissingKeywords.toPrimitives(),
      analyzedAt: this.analysisAnalyzedAt.toPrimitives(),
      legacyAnalysisId: this.analysisLegacyAnalysisId.toPrimitives(),
      createdAt: this.analysisCreatedAt.toPrimitives(),
      updatedAt: this.analysisUpdatedAt.toPrimitives(),
    };
  }
}
