import { createRequestId } from "@/lib/observability";
import type { EventTracker } from "@/modules/shared/domain/repositories/event-tracker.repository";
import { ImpersonationTargetNotFoundError } from "../../domain/errors/impersonation-target-not-found.error";
import { SelfImpersonationError } from "../../domain/errors/self-impersonation.error";
import type { ImpersonationSession } from "../../domain/value-objects/impersonation-session.value-object";
import type { ImpersonationSessionService } from "../../domain/repositories/impersonation-session.service";

export interface StartUserImpersonationInput {
  actorUserId: string;
  actorEmail: string | null;
  targetUserId: string;
}

export class StartUserImpersonationUseCase {
  constructor(
    private readonly deps: {
      impersonationSessionService: ImpersonationSessionService;
      tracker: EventTracker;
    }
  ) {}

  async execute(
    input: StartUserImpersonationInput
  ): Promise<ImpersonationSession> {
    if (input.targetUserId === input.actorUserId) {
      throw new SelfImpersonationError();
    }

    const session = await this.deps.impersonationSessionService.createForUser(input.targetUserId);
    if (!session) {
      throw new ImpersonationTargetNotFoundError(input.targetUserId);
    }

    await this.deps.tracker.record({
      userId: input.actorUserId,
      requestId: createRequestId("imp"),
      stage: "admin_impersonation_started",
      status: "success",
      source: "admin",
      metadata: {
        admin_user_id: input.actorUserId,
        admin_email: input.actorEmail,
        target_user_id: session.targetUserId,
        target_email: session.targetEmail,
      },
    });

    return session;
  }
}
