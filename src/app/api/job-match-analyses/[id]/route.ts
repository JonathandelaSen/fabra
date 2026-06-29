import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import {
  jobMatchAnalysisModule,
  selectionProcessModule,
} from "@/lib/container";
import { presentJobMatchAnalysis } from "@/backend/modules/job-match-analysis";
import { presentFollowUpTracking } from "@/backend/modules/selection-process";
import { parseUpdateJobMatchAnalysisRequest } from "./validation";
import { toJobMatchAnalysisDetailResponse } from "./responses";
import { ok, errorResponse, notFound } from "@/backend/modules/shared";

function latestCreatedEntry<T extends { createdAt: string }>(
  entries: T[],
): T | null {
  return entries.reduce<T | null>((latest, entry) => {
    if (!latest) return entry;
    return Date.parse(entry.createdAt) > Date.parse(latest.createdAt)
      ? entry
      : latest;
  }, null);
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
    jobMatchAnalysisModule.bindRequest(supabase);
    selectionProcessModule.bindRequest(supabase);
    const analysis =
      await jobMatchAnalysisModule.getJobMatchAnalysisById.execute({
        id,
        userId: user.id,
      });
    if (!analysis) {
      throw notFound("Job match analysis not found", ErrorCode.JOB_MATCH_ANALYSIS_NOT_FOUND);
    }

    const response = toJobMatchAnalysisDetailResponse(
      presentJobMatchAnalysis(analysis),
    );
    const tracking =
      await selectionProcessModule.getFollowUpTrackingByAnalysis.execute({
        analysisId: id,
        userId: user.id,
      });
    const presentedTracking = tracking
      ? presentFollowUpTracking(tracking)
      : null;
    const latestEntry = presentedTracking
      ? latestCreatedEntry(presentedTracking.entries)
      : null;

    return ok(
      presentedTracking
        ? {
            ...response,
            offerStatus: presentedTracking.currentStatus,
            offerNotes: latestEntry?.notes ?? null,
            offerNextAction: latestEntry?.nextAction ?? null,
            offerNextActionAt: latestEntry?.nextActionAt ?? null,
            tracking: presentedTracking,
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
    const result = await jobMatchAnalysisModule
      .bindRequest(supabase)
      .deleteJobMatchAnalysis.execute({ id, userId: user.id });
    if (!result.toPrimitives()) {
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

    jobMatchAnalysisModule.bindRequest(supabase);
    selectionProcessModule.bindRequest(supabase);

    if (includesOfferTracking) {
      const entry =
        await selectionProcessModule.createFollowUpEntryByAnalysis.execute({
          analysisId: id,
          userId: user.id,
          status: followUpUpdates.status!,
          occurredAt: new Date().toISOString(),
          updateCurrentStatus: true,
        });
      if (!entry) {
        throw notFound("Analysis not found or update failed", ErrorCode.ANALYSIS_NOT_FOUND);
      }
    }

    const entity =
      Object.keys(allowedUpdates).length > 0
        ? await jobMatchAnalysisModule.updateJobMatchAnalysisJobUrl.execute({
              id,
              userId: user.id,
              jobUrl: allowedUpdates.job_url ?? null,
            })
        : await jobMatchAnalysisModule.getJobMatchAnalysisById.execute({
            id,
            userId: user.id,
          });

    if (!entity) {
      throw notFound("Analysis not found or update failed", ErrorCode.ANALYSIS_NOT_FOUND);
    }

    const response = toJobMatchAnalysisDetailResponse(
      presentJobMatchAnalysis(entity),
    );
    const tracking =
      await selectionProcessModule.getFollowUpTrackingByAnalysis.execute({
        analysisId: id,
        userId: user.id,
      });
    const presentedTracking = tracking
      ? presentFollowUpTracking(tracking)
      : null;
    const latestEntry = presentedTracking
      ? latestCreatedEntry(presentedTracking.entries)
      : null;
    return ok({
      ...response,
      offerStatus: presentedTracking?.currentStatus ?? response.offerStatus,
      offerNotes: latestEntry?.notes ?? null,
      offerNextAction: latestEntry?.nextAction ?? null,
      offerNextActionAt: latestEntry?.nextActionAt ?? null,
      tracking: presentedTracking,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
