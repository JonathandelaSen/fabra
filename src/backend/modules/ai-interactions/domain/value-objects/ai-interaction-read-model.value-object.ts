import { Counter, EntityId, LongText, StringList, Timestamp, ValueObject } from "@/backend/modules/shared";
import type { AIInteractionRating } from "../entities/ai-interaction-review.entity";
import { AIInteractionAssistanceMode } from "./ai-interaction-assistance-mode.value-object";
import { AIInteractionEntityType } from "./ai-interaction-entity-type.value-object";
import { AIInteractionModel } from "./ai-interaction-model.value-object";
import { AIInteractionModule } from "./ai-interaction-module.value-object";
import { AIInteractionOperation } from "./ai-interaction-operation.value-object";
import { AIInteractionParsedResult } from "./ai-interaction-parsed-result.value-object";
import { AIInteractionProvider } from "./ai-interaction-provider.value-object";
import { AIInteractionStatus } from "./ai-interaction-status.value-object";
import {
  AIInteractionReviewSummary,
  type AIInteractionReviewSummaryPrimitives,
} from "./ai-interaction-review-summary.value-object";

export interface AIInteractionReadModelPrimitives {
  interactionId: string;
  module: string;
  operation: string;
  entityType: string;
  entityId: string;
  assistanceMode: string;
  provider: string;
  model: string | null;
  status: string;
  eventNames: string[];
  occurredAt: string;
  prompt: string | null;
  promptHash: string | null;
  promptVersion: string | null;
  rawResponse: string | null;
  parsedResult: unknown | null;
  error: string | null;
  durationMs: number | null;
  review: AIInteractionReviewSummaryPrimitives | null;
}

export class AIInteractionReadModel extends ValueObject<AIInteractionReadModelPrimitives> {
  private constructor(
    private readonly interactionIdVo: EntityId,
    private readonly moduleVo: AIInteractionModule,
    private readonly operationVo: AIInteractionOperation,
    private readonly entityTypeVo: AIInteractionEntityType,
    private readonly entityIdVo: EntityId,
    private readonly assistanceModeVo: AIInteractionAssistanceMode,
    private readonly providerVo: AIInteractionProvider,
    private readonly modelVo: AIInteractionModel | null,
    private readonly statusVo: AIInteractionStatus,
    private readonly eventNamesVo: StringList,
    private readonly occurredAtVo: Timestamp,
    private readonly promptVo: LongText | null,
    private readonly promptHashVo: LongText | null,
    private readonly promptVersionVo: LongText | null,
    private readonly rawResponseVo: LongText | null,
    private readonly parsedResultVo: AIInteractionParsedResult,
    private readonly errorVo: LongText | null,
    private readonly durationMsVo: Counter | null,
    private readonly reviewVo: AIInteractionReviewSummary | null
  ) {
    super();
  }

  static fromPrimitives(p: AIInteractionReadModelPrimitives): AIInteractionReadModel {
    return new AIInteractionReadModel(
      EntityId.fromPrimitives(p.interactionId),
      AIInteractionModule.fromPrimitives(p.module),
      AIInteractionOperation.fromPrimitives(p.operation),
      AIInteractionEntityType.fromPrimitives(p.entityType),
      EntityId.fromPrimitives(p.entityId),
      AIInteractionAssistanceMode.fromPrimitives(p.assistanceMode),
      AIInteractionProvider.fromPrimitives(p.provider),
      p.model === null ? null : AIInteractionModel.fromPrimitives(p.model),
      AIInteractionStatus.fromPrimitives(p.status),
      StringList.fromPrimitives(p.eventNames),
      Timestamp.fromPrimitives(p.occurredAt),
      p.prompt === null ? null : LongText.fromPrimitives(p.prompt),
      p.promptHash === null ? null : LongText.fromPrimitives(p.promptHash),
      p.promptVersion === null ? null : LongText.fromPrimitives(p.promptVersion),
      p.rawResponse === null ? null : LongText.fromPrimitives(p.rawResponse),
      AIInteractionParsedResult.fromPrimitives(p.parsedResult),
      p.error === null ? null : LongText.fromPrimitives(p.error),
      p.durationMs === null ? null : Counter.fromPrimitives(p.durationMs),
      p.review === null ? null : AIInteractionReviewSummary.fromPrimitives(p.review)
    );
  }

  get interactionId(): string {
    return this.interactionIdVo.toPrimitives();
  }

  get module(): string {
    return this.moduleVo.toPrimitives();
  }

  get operation(): string {
    return this.operationVo.toPrimitives();
  }

  get entityType(): string {
    return this.entityTypeVo.toPrimitives();
  }

  get entityId(): string {
    return this.entityIdVo.toPrimitives();
  }

  get assistanceMode(): string {
    return this.assistanceModeVo.toPrimitives();
  }

  get provider(): string {
    return this.providerVo.toPrimitives();
  }

  get model(): string | null {
    return this.modelVo?.toPrimitives() ?? null;
  }

  get status(): string {
    return this.statusVo.toPrimitives();
  }

  get eventNames(): string[] {
    return this.eventNamesVo.toPrimitives();
  }

  get occurredAt(): string {
    return this.occurredAtVo.toPrimitives();
  }

  get prompt(): string | null {
    return this.promptVo?.toPrimitives() ?? null;
  }

  get promptHash(): string | null {
    return this.promptHashVo?.toPrimitives() ?? null;
  }

  get promptVersion(): string | null {
    return this.promptVersionVo?.toPrimitives() ?? null;
  }

  get rawResponse(): string | null {
    return this.rawResponseVo?.toPrimitives() ?? null;
  }

  get parsedResult(): unknown | null {
    return this.parsedResultVo.toPrimitives();
  }

  get error(): string | null {
    return this.errorVo?.toPrimitives() ?? null;
  }

  get durationMs(): number | null {
    return this.durationMsVo?.toPrimitives() ?? null;
  }

  get review(): { rating: AIInteractionRating; note: string | null } | null {
    if (!this.reviewVo) return null;
    return { rating: this.reviewVo.ratingValue, note: this.reviewVo.noteValue };
  }

  toPrimitives(): AIInteractionReadModelPrimitives {
    return {
      interactionId: this.interactionIdVo.toPrimitives(),
      module: this.moduleVo.toPrimitives(),
      operation: this.operationVo.toPrimitives(),
      entityType: this.entityTypeVo.toPrimitives(),
      entityId: this.entityIdVo.toPrimitives(),
      assistanceMode: this.assistanceModeVo.toPrimitives(),
      provider: this.providerVo.toPrimitives(),
      model: this.modelVo?.toPrimitives() ?? null,
      status: this.statusVo.toPrimitives(),
      eventNames: this.eventNamesVo.toPrimitives(),
      occurredAt: this.occurredAtVo.toPrimitives(),
      prompt: this.promptVo?.toPrimitives() ?? null,
      promptHash: this.promptHashVo?.toPrimitives() ?? null,
      promptVersion: this.promptVersionVo?.toPrimitives() ?? null,
      rawResponse: this.rawResponseVo?.toPrimitives() ?? null,
      parsedResult: this.parsedResultVo.toPrimitives(),
      error: this.errorVo?.toPrimitives() ?? null,
      durationMs: this.durationMsVo?.toPrimitives() ?? null,
      review: this.reviewVo?.toPrimitives() ?? null,
    };
  }
}
