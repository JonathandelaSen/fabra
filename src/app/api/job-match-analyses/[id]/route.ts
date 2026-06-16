import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import {
  jobMatchAnalysisModule,
  selectionProcessModule,
} from "@/lib/container";
import { presentJobMatchAnalysis } from "@/modules/job-match-analysis";
import { parseUpdateJobMatchAnalysisRequest } from "./validation";
import {
  toJobMatchAnalysisDetailResponse,
  type JobMatchAnalysisOfferStatus,
} from "./responses";
import { ok, errorResponse, notFound } from "@/modules/shared";

interface FollowUpTrackingRow {
  status: JobMatchAnalysisOfferStatus;
  notes: string | null;
  next_action: string | null;
  next_action_at: string | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const analysis = await jobMatchAnalysisModule
      .bindRequest(supabase)
      .getJobMatchAnalysisById.execute({ id, userId: user.id });
    if (!analysis) {
      throw notFound("Job match analysis not found", ErrorCode.JOB_MATCH_ANALYSIS_NOT_FOUND);
    }

    const response = toJobMatchAnalysisDetailResponse(
      presentJobMatchAnalysis(analysis),
    );
    const { data, error } = await supabase
      .from("follow_ups")
      .select("status, notes, next_action, next_action_at")
      .eq("source_job_match_analysis_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    const tracking = data as FollowUpTrackingRow | null;

    return ok(
      tracking
        ? {
            ...response,
            offerStatus: tracking.status,
            offerNotes: tracking.notes,
            offerNextAction: tracking.next_action,
            offerNextActionAt: tracking.next_action_at,
          }
        : response,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const deleted = await jobMatchAnalysisModule
      .bindRequest(supabase)
      .deleteJobMatchAnalysis.execute({ id, userId: user.id });
    if (!deleted) {
      throw notFound("Job match analysis not found", ErrorCode.JOB_MATCH_ANALYSIS_NOT_FOUND);
    }
    return ok({ success: true });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseUpdateJobMatchAnalysisRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { allowedUpdates, followUpUpdates, includesOfferTracking } = parsed.value;

    if (includesOfferTracking) {
      const followUp = await selectionProcessModule
        .bindRequest(supabase)
        .updateFollowUpByAnalysis.execute({
          analysisId: id,
          userId: user.id,
          ...followUpUpdates,
        });
      if (!followUp) {
        throw notFound("Analysis not found or update failed", ErrorCode.ANALYSIS_NOT_FOUND);
      }
    }

    const entity =
      Object.keys(allowedUpdates).length > 0
        ? await jobMatchAnalysisModule
            .bindRequest(supabase)
            .updateJobMatchAnalysisJobUrl.execute({
              id,
              userId: user.id,
              jobUrl: allowedUpdates.job_url ?? null,
            })
        : await jobMatchAnalysisModule
            .bindRequest(supabase)
            .getJobMatchAnalysisById.execute({ id, userId: user.id });

    if (!entity) {
      throw notFound("Analysis not found or update failed", ErrorCode.ANALYSIS_NOT_FOUND);
    }

    const response = toJobMatchAnalysisDetailResponse(presentJobMatchAnalysis(entity));
    return ok({
      ...response,
      ...(followUpUpdates.status !== undefined
        ? { offerStatus: followUpUpdates.status }
        : {}),
      ...(followUpUpdates.notes !== undefined
        ? { offerNotes: followUpUpdates.notes }
        : {}),
      ...(followUpUpdates.nextAction !== undefined
        ? { offerNextAction: followUpUpdates.nextAction }
        : {}),
      ...(followUpUpdates.nextActionAt !== undefined
        ? { offerNextActionAt: followUpUpdates.nextActionAt }
        : {}),
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
