import type { EventTracker } from "@/modules/shared/domain/repositories/event-tracker.repository";
import { instrumentUseCases, SupabaseEventTracker, type Telemetry } from "@/modules/shared";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { StartUserImpersonationUseCase } from "./application/use-cases/start-user-impersonation.use-case";
import { SupabaseUserRepository } from "./infrastructure/repositories/supabase-user.repository";
import { SupabaseImpersonationSessionService } from "./infrastructure/services/supabase-impersonation-session.service";

const userRepo = new SupabaseUserRepository();
const impersonationSessionService = new SupabaseImpersonationSessionService();
const tracker: EventTracker = new SupabaseEventTracker();

function createUseCases() {
  return {
    listUsers: new ListUsersUseCase({ userRepo }),
    startUserImpersonation: new StartUserImpersonationUseCase({
      impersonationSessionService,
      tracker,
    }),
  };
}

export type AdminModule = ReturnType<typeof createUseCases>;

export function createAdminModule(telemetry: Telemetry): AdminModule {
  return instrumentUseCases("admin", createUseCases(), telemetry);
}
