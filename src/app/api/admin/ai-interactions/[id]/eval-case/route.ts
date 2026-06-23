import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { aiInteractionsModule, evalArtifactsModule } from "@/lib/container";
import { isAdminUser } from "@/lib/observability";
import { errorResponse, forbidden, notFound, ok } from "@/backend/modules/shared";
import { parseSaveAdminAIInteractionEvalCaseRequest } from "./validation";
import type { SaveAdminAIInteractionEvalCaseResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { user } = authContext;
    if (!(await isAdminUser(user.id))) throw forbidden("Forbidden");

    const body = await req.json();
    const parsed = parseSaveAdminAIInteractionEvalCaseRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    const interactions = await aiInteractionsModule.listAIInteractions.execute(user.id);
    const interaction = interactions.find((item) => item.interactionId === id);
    if (!interaction) throw notFound("AI interaction not found");

    const result = await evalArtifactsModule.saveAIInteractionEvalCase.execute({
      interaction: interaction.toPrimitives(),
      name: parsed.value.name,
      note: parsed.value.note,
    });

    return ok(result.toPrimitives() satisfies SaveAdminAIInteractionEvalCaseResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
