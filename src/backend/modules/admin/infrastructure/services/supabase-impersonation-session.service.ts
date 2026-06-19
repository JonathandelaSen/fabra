import { createAdminClient } from "@/lib/supabase/admin";
import { ImpersonationSession } from "../../domain/value-objects/impersonation-session.value-object";
import type { ImpersonationSessionService } from "../../domain/repositories/impersonation-session.service";

export class SupabaseImpersonationSessionService
  implements ImpersonationSessionService
{
  async createForUser(
    targetUserId: string
  ): Promise<ImpersonationSession | null> {
    const admin = createAdminClient();

    const { data: target, error: targetError } =
      await admin.auth.admin.getUserById(targetUserId);
    if (targetError || !target.user?.email) return null;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: target.user.email,
    });
    if (error) throw error;

    return ImpersonationSession.fromPrimitives({
      tokenHash: data.properties.hashed_token,
      targetUserId: target.user.id,
      targetEmail: target.user.email,
    });
  }
}
