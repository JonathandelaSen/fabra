import {
  LongText,
  OptionalTimestamp,
  Timestamp,
  UserId,
  type EventBus,
} from "@/backend/modules/shared";
import type { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { FollowUpEntryId } from "../../domain/value-objects/follow-up-entry-id.value-object";
import { FollowUpStatus } from "../../domain/value-objects/follow-up-status.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface UpdateFollowUpEntryByAnalysisInput {
  analysisId: string;
  entryId: string;
  userId: string;
  status: string;
  title?: string | null;
  notes?: string | null;
  nextAction?: string | null;
  nextActionAt?: string | null;
  occurredAt: string;
}

function optionalText(value: string | null | undefined): LongText | null {
  const normalized = value?.trim();
  return normalized ? LongText.fromPrimitives(normalized) : null;
}

export class UpdateFollowUpEntryByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      entryRepo: FollowUpEntryRepository;
      eventBus: EventBus;
      now?: () => string;
    },
  ) {}

  async execute(
    input: UpdateFollowUpEntryByAnalysisInput,
  ): Promise<FollowUpEntry | null> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.findBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return null;

    const entry = await this.deps.entryRepo.findById(
      FollowUpEntryId.fromPrimitives(input.entryId),
      userId,
    );
    if (!entry || entry.toPrimitives().followUpId !== followUp.id) return null;

    entry.update({
      status: FollowUpStatus.fromPrimitives(input.status),
      title: optionalText(input.title),
      notes: optionalText(input.notes),
      nextAction: optionalText(input.nextAction),
      nextActionAt: OptionalTimestamp.fromPrimitives(input.nextActionAt ?? null),
      updatesCurrentStatus: entry.toPrimitives().updatesCurrentStatus,
      occurredAt: Timestamp.fromPrimitives(input.occurredAt),
      updatedAt: Timestamp.fromPrimitives(
        this.deps.now?.() ?? new Date().toISOString(),
      ),
    });

    const saved = await this.deps.entryRepo.save(entry);
    await this.deps.eventBus.publish(entry.pullDomainEvents());
    return saved;
  }
}
