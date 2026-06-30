import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, notFound, ok } from "@/backend/modules/shared";
import { selectionProcessModule } from "@/lib/container";
import { parseOpportunityPersonRequest } from "./validation";
import {
  toOpportunityPersonResponse,
  type DeleteOpportunityPersonResponse,
} from "./responses";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; personId: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseOpportunityPersonRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id, personId } = await params;
    selectionProcessModule.bindRequest(supabase);
    const person =
      await selectionProcessModule.updateOpportunityPersonByAnalysis.execute({
        analysisId: id,
        personId,
        userId: user.id,
        ...parsed.value,
      });
    if (!person) notFound("Opportunity person not found");

    return ok(toOpportunityPersonResponse(person.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; personId: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id, personId } = await params;
    selectionProcessModule.bindRequest(supabase);
    const result =
      await selectionProcessModule.deleteOpportunityPersonByAnalysis.execute({
        analysisId: id,
        personId,
        userId: user.id,
      });
    if (!result.toPrimitives()) notFound("Opportunity person not found");

    return ok({ success: true } satisfies DeleteOpportunityPersonResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
