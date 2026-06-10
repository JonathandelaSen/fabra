import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvLibraryModule } from "@/lib/container";
import {
  presentCVDocument,
  presentCVStructuredProfile,
} from "@/modules/cv-library";
import { errorResponse, notFound, ok } from "@/modules/shared";
import { parseApplyCVProfileCopyPasteRequest } from "../../../../validation";
import type { ApplyCVProfileCopyPasteResponse } from "./responses";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const body = await req.json();
    const parsed = parseApplyCVProfileCopyPasteRequest(body);
    if (!parsed.ok) return errorResponse(parsed.error);

    const { id } = await params;
    cvLibraryModule.bindRequest(supabase);
    const result = await cvLibraryModule.applyCVProfileStructureCopyPaste.execute({
      cvDocumentId: id,
      userId: user.id,
      parsedResult: parsed.value.parsedResult,
      templateId: parsed.value.templateId,
      locale: parsed.value.locale,
      createTemplateVersion: parsed.value.createTemplateVersion,
    });
    if (!result) throw notFound("CV not found");

    const response = {
      profile: presentCVStructuredProfile(result.profile),
      version: result.version ? presentCVDocument(result.version) : null,
    } satisfies ApplyCVProfileCopyPasteResponse;
    return ok(response);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
