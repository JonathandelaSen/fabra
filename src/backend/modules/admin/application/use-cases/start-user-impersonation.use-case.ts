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

    return session;
  }
}
