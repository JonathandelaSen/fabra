import {
  AggregateRoot,
  BooleanFlag,
  LongText,
  OptionalTimestamp,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { FollowUpEntryCreatedEvent } from "../events/follow-up-entry-created.event";
import { FollowUpEntryUpdatedEvent } from "../events/follow-up-entry-updated.event";
import { FollowUpEntryId } from "../value-objects/follow-up-entry-id.value-object";
import { FollowUpId } from "../value-objects/follow-up-id.value-object";
import {
  FollowUpStatus,
  type FollowUpStatusPrimitives,
} from "../value-objects/follow-up-status.value-object";

export interface FollowUpEntryPrimitives {
  id: string;
  userId: string;
  followUpId: string;
  status: FollowUpStatusPrimitives;
  title: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  updatesCurrentStatus: boolean;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpEntryCreateParams {
  id: FollowUpEntryId;
  userId: UserIdType;
  followUpId: FollowUpId;
  status: FollowUpStatus;
  title: LongText | null;
  notes: LongText | null;
  nextAction: LongText | null;
  nextActionAt: OptionalTimestamp;
  updatesCurrentStatus: boolean;
  occurredAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FollowUpEntryUpdateParams {
  status: FollowUpStatus;
  title: LongText | null;
  notes: LongText | null;
  nextAction: LongText | null;
  nextActionAt: OptionalTimestamp;
  updatesCurrentStatus: boolean;
  occurredAt: Timestamp;
  updatedAt: Timestamp;
}

export class FollowUpEntry extends AggregateRoot {
  private constructor(
    private readonly entryId: FollowUpEntryId,
    private readonly ownerId: UserIdType,
    private readonly parentFollowUpId: FollowUpId,
    private entryStatus: FollowUpStatus,
    private entryTitle: LongText | null,
    private entryNotes: LongText | null,
    private entryNextAction: LongText | null,
    private entryNextActionAt: OptionalTimestamp,
    private entryUpdatesCurrentStatus: BooleanFlag,
    private entryOccurredAt: Timestamp,
    private readonly entryCreatedAt: Timestamp,
    private entryUpdatedAt: Timestamp,
  ) {
    super();
    this.assertNextActionDateHasAction();
  }

  static create(params: FollowUpEntryCreateParams): FollowUpEntry {
    const entry = new FollowUpEntry(
      params.id,
      params.userId,
      params.followUpId,
      params.status,
      params.title,
      params.notes,
      params.nextAction,
      params.nextActionAt,
      BooleanFlag.fromPrimitives(params.updatesCurrentStatus),
      params.occurredAt,
      params.createdAt,
      params.updatedAt,
    );
    entry.recordDomainEvent(
      new FollowUpEntryCreatedEvent(entry.id, params.followUpId.toPrimitives()),
    );
    return entry;
  }

  static fromPrimitives(primitives: FollowUpEntryPrimitives): FollowUpEntry {
    return new FollowUpEntry(
      FollowUpEntryId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      FollowUpId.fromPrimitives(primitives.followUpId),
      FollowUpStatus.fromPrimitives(primitives.status),
      primitives.title === null ? null : LongText.fromPrimitives(primitives.title),
      primitives.notes === null ? null : LongText.fromPrimitives(primitives.notes),
      primitives.nextAction === null
        ? null
        : LongText.fromPrimitives(primitives.nextAction),
      OptionalTimestamp.fromPrimitives(primitives.nextActionAt),
      BooleanFlag.fromPrimitives(primitives.updatesCurrentStatus),
      Timestamp.fromPrimitives(primitives.occurredAt),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  update(params: FollowUpEntryUpdateParams): void {
    this.entryStatus = params.status;
    this.entryTitle = params.title;
    this.entryNotes = params.notes;
    this.entryNextAction = params.nextAction;
    this.entryNextActionAt = params.nextActionAt;
    this.entryUpdatesCurrentStatus = BooleanFlag.fromPrimitives(
      params.updatesCurrentStatus,
    );
    this.entryOccurredAt = params.occurredAt;
    this.entryUpdatedAt = params.updatedAt;
    this.assertNextActionDateHasAction();
    this.recordDomainEvent(
      new FollowUpEntryUpdatedEvent(
        this.id,
        this.parentFollowUpId.toPrimitives(),
      ),
    );
  }

  get id(): string {
    return this.entryId.toPrimitives();
  }

  toPrimitives(): FollowUpEntryPrimitives {
    return {
      id: this.entryId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      followUpId: this.parentFollowUpId.toPrimitives(),
      status: this.entryStatus.toPrimitives(),
      title: this.entryTitle?.toPrimitives() ?? null,
      notes: this.entryNotes?.toPrimitives() ?? null,
      nextAction: this.entryNextAction?.toPrimitives() ?? null,
      nextActionAt: this.entryNextActionAt.toPrimitives(),
      updatesCurrentStatus: this.entryUpdatesCurrentStatus.toPrimitives(),
      occurredAt: this.entryOccurredAt.toPrimitives(),
      createdAt: this.entryCreatedAt.toPrimitives(),
      updatedAt: this.entryUpdatedAt.toPrimitives(),
    };
  }

  private assertNextActionDateHasAction(): void {
    if (
      this.entryNextActionAt.toPrimitives() !== null &&
      this.entryNextAction === null
    ) {
      throw new Error("Next action is required when its date is provided");
    }
  }
}
