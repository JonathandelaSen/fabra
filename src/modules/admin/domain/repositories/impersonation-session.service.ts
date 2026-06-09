import type { ImpersonationSession } from "../value-objects/impersonation-session.value-object";

export interface ImpersonationSessionService {
  createForUser(targetUserId: string): Promise<ImpersonationSession | null>;
}
