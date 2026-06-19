import { NextRequest } from "next/server";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvLibraryModule } from "@/lib/container";
import { presentCVDocument } from "@/backend/modules/cv-library";
import { errorResponse, ok } from "@/backend/modules/shared";
import { parseCreateTemplateVersionRequest } from "./validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const body = await req.json();
    const parsed = parseCreateTemplateVersionRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    cvLibraryModule.bindRequest(supabase);
    const version = await cvLibraryModule.createTemplateVersionFromTemplateCV.execute({
      id,
      userId: user.id,
      templateId: parsed.value.templateId,
      templateLocale: parsed.value.locale,
    });

    return ok({ version: presentCVDocument(version) });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
