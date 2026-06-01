import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { cvLibraryModule } from "@/lib/container";
import { presentCVDocument } from "@/modules/cv-library";
import { created, errorResponse, handleApiError } from "@/modules/shared";
import { parseJsonResumeFromJson, parseJsonResumeFromFormData } from "./validation";
import type { CreateJsonResumeCVDocumentResponse } from "./responses";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const contentType = req.headers.get("content-type") ?? "";
    const parsed = contentType.includes("multipart/form-data")
      ? await parseJsonResumeFromFormData(await req.formData())
      : parseJsonResumeFromJson(await req.json());

    if (!parsed.ok) return errorResponse(parsed.error);

    cvLibraryModule.bindRequest(supabase);

    const { document, warnings } =
      await cvLibraryModule.createJsonResumeCVDocument.execute({
        userId: user.id,
        name: parsed.value.name,
        jsonContent: parsed.value.jsonContent,
        filename: parsed.value.filename,
      });

    return created({
      document: presentCVDocument(document),
      warnings,
    } satisfies CreateJsonResumeCVDocumentResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
