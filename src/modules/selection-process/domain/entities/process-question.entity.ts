import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { ProcessQuestionAnsweredEvent } from "../events/process-question-answered.event";
import { ProcessQuestionCreatedEvent } from "../events/process-question-created.event";
import { ProcessQuestionUpdatedEvent } from "../events/process-question-updated.event";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";
import { ProcessQuestionId } from "../value-objects/process-question-id.value-object";
import { ProcessQuestionText } from "../value-objects/process-question-text.value-object";

export interface ProcessQuestionPrimitives {
  id: string;
  userId: string;
  jobOpportunityId: string | null;
  question: string;
  context: string | null;
  answer: string | null;
  aiModel: string | null;
  aiGeneratedAt: string | null;
  sourceJobMatchAnalysisId: string | null;
  legacyInterviewQuestionId: string | null;
  legacyCvId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessQuestionCreateParams {
  id: ProcessQuestionId;
  userId: UserIdType;
  jobOpportunityId: JobOpportunityId | null;
  question: ProcessQuestionText;
  context: string | null;
  answer: string | null;
  aiModel: string | null;
  aiGeneratedAt: string | null;
  sourceJobMatchAnalysisId: string | null;
  legacyInterviewQuestionId: string | null;
  legacyCvId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ProcessQuestion extends AggregateRoot {
  private constructor(
    private readonly processQuestionId: ProcessQuestionId,
    private readonly ownerId: UserIdType,
    private processQuestionJobOpportunityId: JobOpportunityId | null,
    private processQuestionText: ProcessQuestionText,
    private processQuestionContext: string | null,
    private processQuestionAnswer: string | null,
    private processQuestionAIModel: string | null,
    private processQuestionAIGeneratedAt: string | null,
    private processQuestionSourceJobMatchAnalysisId: string | null,
    private readonly processQuestionLegacyInterviewQuestionId: string | null,
    private processQuestionLegacyCvId: string | null,
    private readonly processQuestionCreatedAt: Timestamp,
    private processQuestionUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: ProcessQuestionCreateParams): ProcessQuestion {
    const question = new ProcessQuestion(
      params.id,
      params.userId,
      params.jobOpportunityId,
      params.question,
      params.context,
      params.answer,
      params.aiModel,
      params.aiGeneratedAt,
      params.sourceJobMatchAnalysisId,
      params.legacyInterviewQuestionId,
      params.legacyCvId,
      params.createdAt,
      params.updatedAt
    );
    question.recordDomainEvent(new ProcessQuestionCreatedEvent(question.id));
    return question;
  }

  static fromPrimitives(primitives: ProcessQuestionPrimitives): ProcessQuestion {
    return new ProcessQuestion(
      ProcessQuestionId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      primitives.jobOpportunityId
        ? JobOpportunityId.fromPrimitives(primitives.jobOpportunityId)
        : null,
      ProcessQuestionText.fromPrimitives(primitives.question),
      primitives.context,
      primitives.answer,
      primitives.aiModel,
      primitives.aiGeneratedAt,
      primitives.sourceJobMatchAnalysisId,
      primitives.legacyInterviewQuestionId,
      primitives.legacyCvId,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt)
    );
  }

  updateAnswer(input: {
    answer: string | null;
    aiModel: string | null;
    aiGeneratedAt: string | null;
    updatedAt: Timestamp;
  }): void {
    this.processQuestionAnswer = input.answer;
    this.processQuestionAIModel = input.aiModel;
    this.processQuestionAIGeneratedAt = input.aiGeneratedAt;
    this.processQuestionUpdatedAt = input.updatedAt;

    if (input.answer && input.answer.trim().length > 0) {
      this.recordDomainEvent(
        new ProcessQuestionAnsweredEvent(this.id, input.aiModel !== null)
      );
    }
  }

  update(input: {
    question?: ProcessQuestionText;
    context?: string | null;
    answer?: string | null;
    jobOpportunityId?: JobOpportunityId | null;
    sourceJobMatchAnalysisId?: string | null;
    legacyCvId?: string | null;
    aiModel?: string | null;
    aiGeneratedAt?: string | null;
    updatedAt: Timestamp;
  }): void {
    const fields: string[] = [];
    if (input.question) {
      this.processQuestionText = input.question;
      fields.push("question");
    }
    if (input.context !== undefined) {
      this.processQuestionContext = input.context;
      fields.push("context");
    }
    if (input.answer !== undefined) {
      this.processQuestionAnswer = input.answer;
      fields.push("answer");
    }
    if (input.jobOpportunityId !== undefined) {
      this.processQuestionJobOpportunityId = input.jobOpportunityId;
      fields.push("jobOpportunityId");
    }
    if (input.sourceJobMatchAnalysisId !== undefined) {
      this.processQuestionSourceJobMatchAnalysisId =
        input.sourceJobMatchAnalysisId;
      fields.push("sourceJobMatchAnalysisId");
    }
    if (input.legacyCvId !== undefined) {
      this.processQuestionLegacyCvId = input.legacyCvId;
      fields.push("legacyCvId");
    }
    if (input.aiModel !== undefined) {
      this.processQuestionAIModel = input.aiModel;
      fields.push("aiModel");
    }
    if (input.aiGeneratedAt !== undefined) {
      this.processQuestionAIGeneratedAt = input.aiGeneratedAt;
      fields.push("aiGeneratedAt");
    }
    this.processQuestionUpdatedAt = input.updatedAt;

    if (fields.length > 0) {
      this.recordDomainEvent(new ProcessQuestionUpdatedEvent(this.id, fields));
    }
  }

  get id(): string {
    return this.processQuestionId.toPrimitives();
  }

  toPrimitives(): ProcessQuestionPrimitives {
    return {
      id: this.id,
      userId: this.ownerId.toPrimitives(),
      jobOpportunityId:
        this.processQuestionJobOpportunityId?.toPrimitives() ?? null,
      question: this.processQuestionText.toPrimitives(),
      context: this.processQuestionContext,
      answer: this.processQuestionAnswer,
      aiModel: this.processQuestionAIModel,
      aiGeneratedAt: this.processQuestionAIGeneratedAt,
      sourceJobMatchAnalysisId: this.processQuestionSourceJobMatchAnalysisId,
      legacyInterviewQuestionId: this.processQuestionLegacyInterviewQuestionId,
      legacyCvId: this.processQuestionLegacyCvId,
      createdAt: this.processQuestionCreatedAt.toPrimitives(),
      updatedAt: this.processQuestionUpdatedAt.toPrimitives(),
    };
  }
}
