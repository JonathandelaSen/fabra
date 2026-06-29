import {
  LongText,
  OptionalTimestamp,
  Timestamp,
  UserId,
  type EventBus,
} from "@/backend/modules/shared";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import type { FollowUpEntryRepository } from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import { FollowUpEntryId } from "../../domain/value-objects/follow-up-entry-id.value-object";
import { FollowUpId } from "../../domain/value-objects/follow-up-id.value-object";
import { FollowUpStatus } from "../../domain/value-objects/follow-up-status.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";

export interface CreateFollowUpEntryByAnalysisInput {
  analysisId: string;
  userId: string;
  status: string;
  title?: string | null;
  notes?: string | null;
  nextAction?: string | null;
  nextActionAt?: string | null;
  occurredAt: string;
  updateCurrentStatus: boolean;
}

function optionalText(value: string | null | undefined): LongText | null {
  const normalized = value?.trim();
  return normalized ? LongText.fromPrimitives(normalized) : null;
}

export class CreateFollowUpEntryByAnalysisUseCase {
  constructor(
    private readonly deps: {
      followUpRepo: FollowUpRepository;
      entryRepo: FollowUpEntryRepository;
      eventBus: EventBus;
      randomId?: () => string;
      now?: () => string;
    },
  ) {}

  async execute(
    input: CreateFollowUpEntryByAnalysisInput,
  ): Promise<FollowUpEntry | null> {
    const userId = UserId.fromPrimitives(input.userId);
    const followUp = await this.deps.followUpRepo.ensureBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(input.analysisId),
      userId,
    );
    if (!followUp) return null;

    const status = FollowUpStatus.fromPrimitives(input.status);
    const now = this.deps.now?.() ?? new Date().toISOString();
    const changesCurrentStatus =
      input.updateCurrentStatus &&
      followUp.toPrimitives().status !== status.toPrimitives();

    if (changesCurrentStatus) {
      followUp.changeStatus(status, Timestamp.fromPrimitives(now));
    }

    const entry = FollowUpEntry.create({
      id: FollowUpEntryId.fromPrimitives(
        this.deps.randomId?.() ?? crypto.randomUUID(),
      ),
      userId,
      followUpId: FollowUpId.fromPrimitives(followUp.id),
      status,
      title: optionalText(input.title),
      notes: optionalText(input.notes),
      nextAction: optionalText(input.nextAction),
      nextActionAt: OptionalTimestamp.fromPrimitives(input.nextActionAt ?? null),
      updatesCurrentStatus: changesCurrentStatus,
      occurredAt: Timestamp.fromPrimitives(input.occurredAt),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await this.deps.entryRepo.save(entry);
    await this.deps.eventBus.publish([
      ...followUp.pullDomainEvents(),
      ...entry.pullDomainEvents(),
    ]);
    return saved;
  }
}
