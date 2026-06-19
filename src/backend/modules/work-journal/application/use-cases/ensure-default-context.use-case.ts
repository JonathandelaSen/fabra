import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { WorkJournalContext } from "../../domain/entities/journal-context.entity";
import type { WorkJournalContextRepository } from "../../domain/repositories/work-journal-context.repository";
import type { CVDataRepository } from "../../domain/repositories/cv-data.repository";
import { WorkJournalContextId } from "../../domain/value-objects/work-journal-context-id.value-object";
import { WorkJournalContextName } from "../../domain/value-objects/work-journal-context-name.value-object";
import { WorkJournalContextStatus } from "../../domain/value-objects/work-journal-context-status.value-object";
import { WorkJournalContextType } from "../../domain/value-objects/work-journal-context-type.value-object";
import { WorkJournalCreatedFromCv } from "../../domain/value-objects/work-journal-created-from-cv.value-object";
import { WorkJournalIsDefault } from "../../domain/value-objects/work-journal-is-default.value-object";
import { WorkJournalRoleOrLabel } from "../../domain/value-objects/work-journal-role-or-label.value-object";

export class EnsureDefaultContextUseCase {
  constructor(
    private readonly deps: {
      contextRepo: WorkJournalContextRepository;
      cvDataRepo: CVDataRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(userId: string): Promise<WorkJournalContext | null> {
    const ownerId = UserId.fromPrimitives(userId);
    const contexts = await this.deps.contextRepo.search({ userId: ownerId });
    const active = contexts.filter((c) => c.isActive());
    const currentDefault = active.find((c) => c.isDefault);
    if (currentDefault) return currentDefault;

    const now = new Date().toISOString();
    const context = WorkJournalContext.create({
      id: WorkJournalContextId.fromPrimitives(crypto.randomUUID()),
      userId: ownerId,
      type: WorkJournalContextType.fromPrimitives("other"),
      name: WorkJournalContextName.fromPrimitives("General"),
      roleOrLabel: WorkJournalRoleOrLabel.fromPrimitives(null),
      status: WorkJournalContextStatus.fromPrimitives("active"),
      isDefault: WorkJournalIsDefault.fromPrimitives(true),
      createdFromCv: WorkJournalCreatedFromCv.fromPrimitives(true),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const created = await this.deps.contextRepo.save(context);

    const events = context.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return created;
  }
}
