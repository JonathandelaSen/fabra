import type { SupabaseClient } from "@supabase/supabase-js";
import type { Analysis } from "@/lib/analysis-types";
import { getBestCVText } from "@/lib/cv-profile";
import type { QueryBus } from "@/backend/modules/shared";
import type { SupabaseAware } from "@/backend/modules/shared/infrastructure/supabase-aware";
import { GetCVAnalysisByIdQuery } from "@/backend/modules/cv-analysis";
import { GetJobMatchAnalysisByIdQuery } from "@/backend/modules/job-match-analysis";
import {
  ListOpportunityPeopleForChatQuery,
  type OpportunityPersonChatContextPrimitives,
} from "@/backend/modules/selection-process";
import { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";
import type { JobAnalysisChatContextReader } from "../../domain/repositories/job-analysis-chat-context.repository";

export class JobAnalysisChatContextRepository
  implements JobAnalysisChatContextReader, SupabaseAware
{
  private client!: SupabaseClient;

  constructor(private readonly queryBus: QueryBus) {}

  bindRequest(client: SupabaseClient) {
    this.client = client;
  }

  async findByAnalysisId(input: {
    analysisId: string;
    userId: string;
  }): Promise<JobAnalysisChatContext | null> {
    const analysis = await this.getAnalysis(input.analysisId, input.userId);
    if (!analysis) return null;

    const cvPromise = analysis.cv_id
      ? this.client
          .from("cvs")
          .select("*")
          .eq("id", analysis.cv_id)
          .eq("user_id", input.userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });
    const peoplePromise = this.queryBus.execute<
      OpportunityPersonChatContextPrimitives[]
    >(
      new ListOpportunityPeopleForChatQuery({
        analysisId: input.analysisId,
        userId: input.userId,
      }),
    );
    const [{ data: cv, error }, people] = await Promise.all([
      cvPromise,
      peoplePromise,
    ]);
    if (error) throw error;

    return JobAnalysisChatContext.fromPrimitives({
      analysisId: analysis.id,
      cvId: analysis.cv_id,
      analysisMode: analysis.analysis_mode,
      analysis,
      cv,
      cvText: getBestCVText(analysis),
      people,
    });
  }

  private async getAnalysis(
    id: string,
    userId: string,
  ): Promise<Analysis | null> {
    const cvAnalysis = await this.queryBus.execute<Analysis | null>(
      new GetCVAnalysisByIdQuery({ id, userId }),
    );
    if (cvAnalysis) return cvAnalysis;

    const jobMatchAnalysis = await this.queryBus.execute<Analysis | null>(
      new GetJobMatchAnalysisByIdQuery({ id, userId }),
    );
    if (jobMatchAnalysis) return jobMatchAnalysis;

    return null;
  }
}
