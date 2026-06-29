import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { presentFollowUpEntry } from "@/backend/modules/selection-process";
import {
  created,
  errorResponse,
  notFound,
} from "@/backend/modules/shared";
import { selectionProcessModule } from "@/lib/container";
import { parseCreateFollowUpEntryRequest } from "./validation";
import type { CreateFollowUpEntryResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseCreateFollowUpEntryRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);
    const entry = await selectionProcessModule.createFollowUpEntryByAnalysis.execute({
      analysisId: id,
      userId: user.id,
      ...parsed.value,
    });
    if (!entry) throw notFound("Job match analysis not found");

    return created(
      presentFollowUpEntry(entry) satisfies CreateFollowUpEntryResponse,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
