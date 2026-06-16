import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { createRequestId, hasExtractedText } from "@/lib/observability";
import { extractPdfText } from "@/lib/pdf-extraction";
import { cvLibraryModule } from "@/lib/container";
import { CV_PDFS_BUCKET, presentCVDocument } from "@/modules/cv-library";
import { parseUploadCVFormData } from "./validation";
import type { ParseCVUploadResponse } from "./responses";
import { ok, errorResponse } from "@/modules/shared";

export async function POST(req: NextRequest) {
  const requestId = createRequestId("parse");
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;
    const userId = user.id;

    const formData = await req.formData();
    const parsed = parseUploadCVFormData(formData);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const { file, requestedName } = parsed.value;

    const cvId = crypto.randomUUID();

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const pdfStoragePath = `${user.id}/${cvId}-${safeFilename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(CV_PDFS_BUCKET)
      .upload(pdfStoragePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const extracted = await extractPdfText(buffer, {
      userId,
      cvId,
      requestId,
      fileSize: file.size,
      filename: file.name,
      pdfStoragePath,
    });

    const extractedTexts = [
      extracted.text_python,
      extracted.text_pdfjs,
      extracted.text_node,
    ];

    if (!hasExtractedText(extractedTexts)) {
      await supabase.storage
        .from(CV_PDFS_BUCKET)
        .remove([pdfStoragePath])
        .catch(() => {});
      return NextResponse.json(
        {
          error:
            "No se ha podido extraer texto del PDF. Prueba con un PDF con texto seleccionable.",
          errors: {
            python: extracted.extract_error_python,
            pdfjs: extracted.extract_error_pdfjs,
            node: extracted.extract_error_node,
          },
        },
        { status: 400 }
      );
    }

    const cvDocument = await cvLibraryModule
      .bindRequest(supabase)
      .createUploadedCVDocument.execute({
      id: cvId,
      userId: user.id,
      name: requestedName || file.name.replace(/\.pdf$/i, ""),
      filename: file.name,
      fileSize: file.size,
      pdfStoragePath,
      textPython: extracted.text_python,
      textPdfjs: extracted.text_pdfjs,
      textNode: extracted.text_node,
      extractErrorPython: extracted.extract_error_python,
      extractErrorPdfjs: extracted.extract_error_pdfjs,
      extractErrorNode: extracted.extract_error_node,
    });
    const cv = presentCVDocument(cvDocument);

    return ok({
      id: cv.id,
      cvId: cv.id,
      filename: cv.filename,
      created_at: cv.created_at,
      texts: {
        python: cv.text_python,
        pdfjs: cv.text_pdfjs,
        node: cv.text_node,
      },
      errors: {
        python: cv.extract_error_python,
        pdfjs: cv.extract_error_pdfjs,
        node: cv.extract_error_node,
      },
    } satisfies ParseCVUploadResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
