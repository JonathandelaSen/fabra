import { AggregateRoot, EntityId, UserId } from "@/modules/shared";
import { ActivityContextArchivedEvent } from "../events/activity-context-archived.event";
import { ActivityContextCreatedEvent } from "../events/activity-context-created.event";
import { ActivityContextDeletedEvent } from "../events/activity-context-deleted.event";
import { ActivityContextRestoredEvent } from "../events/activity-context-restored.event";
import { ActivityContextUpdatedEvent } from "../events/activity-context-updated.event";

export type ActivityContextType = "employment" | "project" | "personal" | "other";
export type ActivityContextStatus = "active" | "archived";

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
      status: params.status ?? "active",
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
    if (previousStatus !== "archived" && this.state.status === "archived") {
      this.recordDomainEvent(new ActivityContextArchivedEvent(this.id));
    } else if (previousStatus === "archived" && this.state.status === "active") {
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
  if (!["employment", "project", "personal", "other"].includes(value)) {
    throw new Error("Invalid activity context type.");
  }
  return value;
}

function assertStatus(value: ActivityContextStatus): ActivityContextStatus {
  if (!["active", "archived"].includes(value)) {
    throw new Error("Invalid activity context status.");
  }
  return value;
}

function assertName(value: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error("Activity context name cannot be empty.");
  if (normalized.length > 160) throw new Error("Activity context name is too long.");
  return normalized;
}
