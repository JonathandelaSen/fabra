import {
  AggregateRoot,
  EntityId,
  LongText,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { FollowUpCreatedEvent } from "../events/follow-up-created.event";
import { FollowUpStatusChangedEvent } from "../events/follow-up-status-changed.event";
import { FollowUpUpdatedEvent } from "../events/follow-up-updated.event";
import { FollowUpId } from "../value-objects/follow-up-id.value-object";
import {
  FollowUpStatus,
  type FollowUpStatusPrimitives,
} from "../value-objects/follow-up-status.value-object";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

export interface FollowUpPrimitives {
  id: string;
  userId: string;
  jobOpportunityId: string;
  status: FollowUpStatusPrimitives;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  sourceJobMatchAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpCreateParams {
  id: FollowUpId;
  userId: UserIdType;
  jobOpportunityId: JobOpportunityId;
  status: FollowUpStatus;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  sourceJobMatchAnalysisId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FollowUp extends AggregateRoot {
  private constructor(
    private readonly followUpId: FollowUpId,
    private readonly ownerId: UserIdType,
    private readonly opportunityId: JobOpportunityId,
    private followUpStatus: FollowUpStatus,
    private followUpNotes: string | null,
    private followUpNextAction: string | null,
    private followUpNextActionAt: string | null,
    private readonly followUpSourceJobMatchAnalysisId: string | null,
    private readonly followUpCreatedAt: Timestamp,
    private followUpUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: FollowUpCreateParams): FollowUp {
    const followUp = new FollowUp(
      params.id,
      params.userId,
      params.jobOpportunityId,
      params.status,
      params.notes,
      params.nextAction,
      params.nextActionAt,
      params.sourceJobMatchAnalysisId,
      params.createdAt,
      params.updatedAt
    );
    followUp.recordDomainEvent(new FollowUpCreatedEvent(followUp.id));
    return followUp;
  }

  static fromPrimitives(primitives: FollowUpPrimitives): FollowUp {
    return new FollowUp(
      FollowUpId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      JobOpportunityId.fromPrimitives(primitives.jobOpportunityId),
      FollowUpStatus.fromPrimitives(primitives.status),
      primitives.notes,
      primitives.nextAction,
      primitives.nextActionAt,
      primitives.sourceJobMatchAnalysisId,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt)
    );
  }

  update(input: {
    status: FollowUpStatus;
    notes: string | null;
    nextAction: string | null;
    nextActionAt: string | null;
    updatedAt: Timestamp;
  }): void {
    const previousStatus = this.followUpStatus.toPrimitives();
    this.followUpStatus = input.status;
    this.followUpNotes = input.notes;
    this.followUpNextAction = input.nextAction;
    this.followUpNextActionAt = input.nextActionAt;
    this.followUpUpdatedAt = input.updatedAt;

    this.recordDomainEvent(new FollowUpUpdatedEvent(this.id));
    const newStatus = input.status.toPrimitives();
    if (previousStatus !== newStatus) {
      this.recordDomainEvent(new FollowUpStatusChangedEvent(this.id, previousStatus, newStatus));
    }
  }

  changeStatus(status: FollowUpStatus, updatedAt: Timestamp): void {
    const previousStatus = this.followUpStatus.toPrimitives();
    const newStatus = status.toPrimitives();
    this.followUpStatus = status;
    this.followUpUpdatedAt = updatedAt;

    this.recordDomainEvent(new FollowUpUpdatedEvent(this.id));
    if (previousStatus !== newStatus) {
      this.recordDomainEvent(
        new FollowUpStatusChangedEvent(this.id, previousStatus, newStatus),
      );
    }
  }

  get id(): string {
    return this.followUpId.toPrimitives();
  }

  toPrimitives(): FollowUpPrimitives {
    return {
      id: this.followUpId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      jobOpportunityId: this.opportunityId.toPrimitives(),
      status: this.followUpStatus.toPrimitives(),
      notes: this.followUpNotes
        ? LongText.fromPrimitives(this.followUpNotes).toPrimitives()
        : null,
      nextAction: this.followUpNextAction
        ? LongText.fromPrimitives(this.followUpNextAction).toPrimitives()
        : null,
      nextActionAt: this.followUpNextActionAt
        ? Timestamp.fromPrimitives(this.followUpNextActionAt).toPrimitives()
        : null,
      sourceJobMatchAnalysisId: this.followUpSourceJobMatchAnalysisId
        ? EntityId.fromPrimitives(this.followUpSourceJobMatchAnalysisId).toPrimitives()
        : null,
      createdAt: this.followUpCreatedAt.toPrimitives(),
      updatedAt: this.followUpUpdatedAt.toPrimitives(),
    };
  }
}
