import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { createRequestId, hasExtractedText } from "@/lib/observability";
import { cvLibraryModule } from "@/lib/container";
import { CV_PDFS_BUCKET, presentCVDocument, presentCVDocuments } from "@/backend/modules/cv-library";
import { parseUploadCVFormData } from "./validation";
import { ok, errorResponse } from "@/backend/modules/shared";
import {
  type CVDocumentDetailResponse,
  type CVDocumentSummaryResponse,
  toCVDocumentDetailResponse,
  toCVDocumentSummaryResponse,
  type CreateCVDocumentResponse,
  type ListCVDocumentsResponse,
} from "./responses";

type LegacyCVDocumentSummary = ReturnType<typeof presentCVDocuments>[number];
type CompatCVDocumentSummary = LegacyCVDocumentSummary & CVDocumentSummaryResponse;
type CompatCVDocumentDetail = ReturnType<typeof presentCVDocument> & CVDocumentDetailResponse;

function toCompatCVDocumentSummary(
  cv: LegacyCVDocumentSummary
): CompatCVDocumentSummary {
  return { ...cv, ...toCVDocumentSummaryResponse(cv) };
}

function toCompatCVDocumentDetail(
  cv: ReturnType<typeof presentCVDocument>
): CompatCVDocumentDetail {
  return { ...cv, ...toCVDocumentDetailResponse(cv) };
}

export async function GET() {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const cvs = await cvLibraryModule
      .bindRequest(supabase)
      .listCVDocuments.execute({ userId: user.id });
    return ok(
      presentCVDocuments(cvs).map(toCompatCVDocumentSummary) satisfies ListCVDocumentsResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId("cv_upload");
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

    const extracted = (
      await cvLibraryModule.bindRequest(supabase).extractCVUploadText.execute({
        buffer,
        context: {
          userId,
          cvId,
          requestId,
          fileSize: file.size,
          filename: file.name,
          pdfStoragePath,
        },
      })
    ).toPrimitives();

    const extractedTexts = [
      extracted.textPython,
      extracted.textPdfjs,
      extracted.textNode,
    ];

    if (!hasExtractedText(extractedTexts)) {
      await supabase.storage
        .from(CV_PDFS_BUCKET)
        .remove([pdfStoragePath])
        .catch(() => {});
      return NextResponse.json(
        {
          error:
            "Could not extract text from the PDF. Please try a PDF with selectable text.",
          errors: {
            python: extracted.extractErrorPython,
            pdfjs: extracted.extractErrorPdfjs,
            node: extracted.extractErrorNode,
          },
        },
        { status: 400 }
      );
    }

    const cv = await cvLibraryModule
      .bindRequest(supabase)
      .createUploadedCVDocument.execute({
      id: cvId,
      userId: user.id,
      name: requestedName || file.name.replace(/\.pdf$/i, ""),
      filename: file.name,
      fileSize: file.size,
      pdfStoragePath,
      textPython: extracted.textPython,
      textPdfjs: extracted.textPdfjs,
      textNode: extracted.textNode,
      extractErrorPython: extracted.extractErrorPython,
      extractErrorPdfjs: extracted.extractErrorPdfjs,
      extractErrorNode: extracted.extractErrorNode,
    });
    const responseCV = presentCVDocument(cv);

    return ok(
      toCompatCVDocumentDetail(responseCV) satisfies CreateCVDocumentResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
