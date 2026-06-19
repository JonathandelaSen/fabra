import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { WorkJournalContext, type ContextType } from "../../domain/entities/journal-context.entity";
import type { WorkJournalContextRepository } from "../../domain/repositories/work-journal-context.repository";
import { WorkJournalContextId } from "../../domain/value-objects/work-journal-context-id.value-object";
import { WorkJournalContextName } from "../../domain/value-objects/work-journal-context-name.value-object";
import { WorkJournalContextStatus } from "../../domain/value-objects/work-journal-context-status.value-object";
import { WorkJournalContextType } from "../../domain/value-objects/work-journal-context-type.value-object";
import { WorkJournalCreatedFromCv } from "../../domain/value-objects/work-journal-created-from-cv.value-object";
import { WorkJournalIsDefault } from "../../domain/value-objects/work-journal-is-default.value-object";
import { WorkJournalRoleOrLabel } from "../../domain/value-objects/work-journal-role-or-label.value-object";

export interface PromoteWorkJournalSuggestionInput {
  userId: string;
  type: ContextType;
  name: string;
  role_or_label: string | null;
}

export class PromoteWorkJournalSuggestionUseCase {
  constructor(
    private readonly deps: {
      contextRepo: WorkJournalContextRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: PromoteWorkJournalSuggestionInput): Promise<WorkJournalContext> {
    const now = new Date().toISOString();
    const context = WorkJournalContext.create({
      id: WorkJournalContextId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      type: WorkJournalContextType.fromPrimitives(input.type),
      name: WorkJournalContextName.fromPrimitives(input.name),
      roleOrLabel: WorkJournalRoleOrLabel.fromPrimitives(input.role_or_label),
      status: WorkJournalContextStatus.fromPrimitives("active"),
      isDefault: WorkJournalIsDefault.fromPrimitives(false),
      createdFromCv: WorkJournalCreatedFromCv.fromPrimitives(true),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.contextRepo.save(context);
    const events = context.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    return saved;
  }
}
