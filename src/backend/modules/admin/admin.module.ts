import { instrumentUseCases, type Telemetry } from "@/backend/modules/shared";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { DeleteUserUseCase } from "./application/use-cases/delete-user.use-case";
import { StartUserImpersonationUseCase } from "./application/use-cases/start-user-impersonation.use-case";
import { SupabaseUserRepository } from "./infrastructure/repositories/supabase-user.repository";
import { SupabaseImpersonationSessionService } from "./infrastructure/services/supabase-impersonation-session.service";
import { SupabaseContentMetricsRepository } from "./infrastructure/repositories/supabase-content-metrics.repository";
import { GetCVContentMetricsUseCase } from "./application/use-cases/get-cv-content-metrics.use-case";
import { GetAnalysisContentMetricsUseCase } from "./application/use-cases/get-analysis-content-metrics.use-case";
import { GetOpportunitiesContentMetricsUseCase } from "./application/use-cases/get-opportunities-content-metrics.use-case";
import { GetFeedbackContentMetricsUseCase } from "./application/use-cases/get-feedback-content-metrics.use-case";
import { GetWorkspaceContentMetricsUseCase } from "./application/use-cases/get-workspace-content-metrics.use-case";

const userRepo = new SupabaseUserRepository();
const impersonationSessionService = new SupabaseImpersonationSessionService();
const contentMetricsRepo = new SupabaseContentMetricsRepository();

function createUseCases() {
  return {
    listUsers: new ListUsersUseCase({ userRepo }),
    deleteUser: new DeleteUserUseCase({ userRepo }),
    startUserImpersonation: new StartUserImpersonationUseCase({
      impersonationSessionService,
    }),
    getCVContentMetrics: new GetCVContentMetricsUseCase({ contentMetricsRepo }),
    getAnalysisContentMetrics: new GetAnalysisContentMetricsUseCase({ contentMetricsRepo }),
    getOpportunitiesContentMetrics: new GetOpportunitiesContentMetricsUseCase({ contentMetricsRepo }),
    getFeedbackContentMetrics: new GetFeedbackContentMetricsUseCase({ contentMetricsRepo }),
    getWorkspaceContentMetrics: new GetWorkspaceContentMetricsUseCase({ contentMetricsRepo }),
  };
}

export type AdminModule = ReturnType<typeof createUseCases>;

export function createAdminModule(telemetry: Telemetry): AdminModule {
  return instrumentUseCases("admin", createUseCases(), telemetry);
}
