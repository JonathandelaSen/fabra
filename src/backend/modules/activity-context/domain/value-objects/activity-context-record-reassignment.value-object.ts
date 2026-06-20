import { EntityId, UserId, ValueObject } from "@/backend/modules/shared";

export interface ActivityContextRecordReassignmentPrimitives {
  userId: string;
  sourceContextId: string;
  defaultContextId: string;
}

export class ActivityContextRecordReassignment extends ValueObject<ActivityContextRecordReassignmentPrimitives> {
  private constructor(
    private readonly reassignmentUserId: UserId,
    private readonly reassignmentSourceContextId: EntityId,
    private readonly reassignmentDefaultContextId: EntityId
  ) {
    super();
  }

  static fromPrimitives(
    primitives: ActivityContextRecordReassignmentPrimitives
  ): ActivityContextRecordReassignment {
    return new ActivityContextRecordReassignment(
      UserId.fromPrimitives(primitives.userId),
      EntityId.fromPrimitives(primitives.sourceContextId),
      EntityId.fromPrimitives(primitives.defaultContextId)
    );
  }

  get userId(): UserId {
    return this.reassignmentUserId;
  }

  get sourceContextId(): EntityId {
    return this.reassignmentSourceContextId;
  }

  get defaultContextId(): EntityId {
    return this.reassignmentDefaultContextId;
  }

  toPrimitives(): ActivityContextRecordReassignmentPrimitives {
    return {
      userId: this.reassignmentUserId.toPrimitives(),
      sourceContextId: this.reassignmentSourceContextId.toPrimitives(),
      defaultContextId: this.reassignmentDefaultContextId.toPrimitives(),
    };
  }
}
