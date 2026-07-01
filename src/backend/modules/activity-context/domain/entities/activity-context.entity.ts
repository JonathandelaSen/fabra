import { AggregateRoot, EntityId, UserId } from "@/backend/modules/shared";
import { ActivityContextArchivedEvent } from "../events/activity-context-archived.event";
import { ActivityContextCreatedEvent } from "../events/activity-context-created.event";
import { ActivityContextDeletedEvent } from "../events/activity-context-deleted.event";
import { ActivityContextRestoredEvent } from "../events/activity-context-restored.event";
import { ActivityContextUpdatedEvent } from "../events/activity-context-updated.event";
import { InvalidActivityContextNameError } from "../errors/invalid-activity-context-name.error";
import { InvalidActivityContextStatusError } from "../errors/invalid-activity-context-status.error";
import { InvalidActivityContextTypeError } from "../errors/invalid-activity-context-type.error";

export const activityContextTypes = {
  employment: "employment",
  project: "project",
  personal: "personal",
  other: "other",
} as const;

export const activityContextStatuses = {
  active: "active",
  archived: "archived",
} as const;

export type ActivityContextType =
  (typeof activityContextTypes)[keyof typeof activityContextTypes];
export type ActivityContextStatus =
  (typeof activityContextStatuses)[keyof typeof activityContextStatuses];

export interface ActivityContextPrimitives {
  id: string;
  userId: string;
  type: ActivityContextType;
  name: string;
  status: ActivityContextStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityContextCreateParams {
  id: EntityId;
  userId: UserId;
  type: ActivityContextType;
  name: string;
  status?: ActivityContextStatus;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ActivityContext extends AggregateRoot {
  private constructor(private state: ActivityContextPrimitives) {
    super();
  }

  static create(params: ActivityContextCreateParams): ActivityContext {
    const context = new ActivityContext({
      id: params.id.toPrimitives(),
      userId: params.userId.toPrimitives(),
      type: assertType(params.type),
      name: assertName(params.name),
      status: params.status ?? activityContextStatuses.active,
      isDefault: params.isDefault ?? false,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
    context.recordDomainEvent(new ActivityContextCreatedEvent(context.id));
    return context;
  }

  static fromPrimitives(primitives: ActivityContextPrimitives): ActivityContext {
    return new ActivityContext({ ...primitives });
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string {
    return this.state.userId;
  }

  get isDefault(): boolean {
    return this.state.isDefault;
  }

  get status(): ActivityContextStatus {
    return this.state.status;
  }

  update(input: Partial<Pick<ActivityContextPrimitives, "type" | "name" | "status">> & { updatedAt: string }): void {
    const previousStatus = this.state.status;
    const fields: string[] = [];
    if (input.type !== undefined) {
      this.state.type = assertType(input.type);
      fields.push("type");
    }
    if (input.name !== undefined) {
      this.state.name = assertName(input.name);
      fields.push("name");
    }
    if (input.status !== undefined) {
      this.state.status = assertStatus(input.status);
      fields.push("status");
    }
    this.state.updatedAt = input.updatedAt;

    if (fields.length > 0) {
      this.recordDomainEvent(new ActivityContextUpdatedEvent(this.id, fields));
    }
    if (
      previousStatus !== activityContextStatuses.archived &&
      this.state.status === activityContextStatuses.archived
    ) {
      this.recordDomainEvent(new ActivityContextArchivedEvent(this.id));
    } else if (
      previousStatus === activityContextStatuses.archived &&
      this.state.status === activityContextStatuses.active
    ) {
      this.recordDomainEvent(new ActivityContextRestoredEvent(this.id));
    }
  }

  delete(): void {
    this.recordDomainEvent(new ActivityContextDeletedEvent(this.id));
  }

  toPrimitives(): ActivityContextPrimitives {
    return { ...this.state };
  }
}

function assertType(value: ActivityContextType): ActivityContextType {
  if (!Object.values(activityContextTypes).includes(value)) {
    throw new InvalidActivityContextTypeError(value);
  }
  return value;
}

function assertStatus(value: ActivityContextStatus): ActivityContextStatus {
  if (!Object.values(activityContextStatuses).includes(value)) {
    throw new InvalidActivityContextStatusError(value);
  }
  return value;
}

function assertName(value: string): string {
  const normalized = value.trim();
  if (!normalized) throw new InvalidActivityContextNameError(value, "Activity context name cannot be empty.");
  if (normalized.length > 160) throw new InvalidActivityContextNameError(value, "Activity context name is too long.");
  return normalized;
}
