import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import {
  created,
  errorResponse,
  notFound,
  ok,
} from "@/backend/modules/shared";
import { selectionProcessModule } from "@/lib/container";
import {
  toOpportunityPeopleResponse,
  toOpportunityPersonResponse,
} from "./responses";
import { parseOpportunityPersonRequest } from "./validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);
    const people =
      await selectionProcessModule.listOpportunityPeopleByAnalysis.execute({
        analysisId: id,
        userId: user.id,
      });

    return ok(
      toOpportunityPeopleResponse(people.map((person) => person.toPrimitives())),
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseOpportunityPersonRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    selectionProcessModule.bindRequest(supabase);
    const person =
      await selectionProcessModule.createOpportunityPersonByAnalysis.execute({
        analysisId: id,
        userId: user.id,
        ...parsed.value,
      });
    if (!person) notFound("Job match analysis not found");

    return created(toOpportunityPersonResponse(person.toPrimitives()));
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
