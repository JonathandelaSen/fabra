import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { presentFollowUpEntry } from "@/backend/modules/selection-process";
import { errorResponse, notFound, ok } from "@/backend/modules/shared";
import { selectionProcessModule } from "@/lib/container";
import type {
  DeleteFollowUpEntryResponse,
  UpdateFollowUpEntryResponse,
} from "./responses";
import { parseUpdateFollowUpEntryRequest } from "./validation";

interface RouteParams {
  id: string;
  entryId: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseUpdateFollowUpEntryRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id, entryId } = await params;
    selectionProcessModule.bindRequest(supabase);
    const entry = await selectionProcessModule.updateFollowUpEntryByAnalysis.execute({
      analysisId: id,
      entryId,
      userId: user.id,
      ...parsed.value,
    });
    if (!entry) throw notFound("Tracking entry not found");

    return ok(
      presentFollowUpEntry(entry) satisfies UpdateFollowUpEntryResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id, entryId } = await params;
    selectionProcessModule.bindRequest(supabase);
    const deleted = await selectionProcessModule.deleteFollowUpEntryByAnalysis.execute({
      analysisId: id,
      entryId,
      userId: user.id,
    });
    if (!deleted.toPrimitives()) throw notFound("Tracking entry not found");

    return ok({ success: true } satisfies DeleteFollowUpEntryResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
