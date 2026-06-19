import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { NextRequest, NextResponse } from "next/server";
import { ErrorCode } from "@/shared/error-codes";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import {
  generatePublicCVId,
  normalizePublicCVSlug,
} from "@/backend/modules/cv-library";
import {
  cvAnalysisModule,
  cvLibraryModule,
  jobMatchAnalysisModule,
} from "@/lib/container";
import { presentCVDocument } from "@/backend/modules/cv-library";
import { parseUpdateCVDocumentRequest } from "./validation";
import { ok, errorResponse, notFound, badRequest } from "@/backend/modules/shared";
import {
  type CVDocumentDetailResponse,
  toCVDocumentDetailResponse,
  type DeleteCVDocumentResponse,
  type CVDocumentDeleteConflictResponse,
  CV_DELETE_CONFLICT_CODE,
  type GetCVDocumentResponse,
  type UpdateCVDocumentResponse,
} from "./responses";

type LegacyCVDocumentDetail = ReturnType<typeof presentCVDocument>;
type CompatCVDocumentDetail = LegacyCVDocumentDetail & CVDocumentDetailResponse;

function toCompatCVDocumentDetail(cv: LegacyCVDocumentDetail): CompatCVDocumentDetail {
  return { ...cv, ...toCVDocumentDetailResponse(cv) };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const cv = await cvLibraryModule
      .bindRequest(supabase)
      .getCVDocument.execute({ id, userId: user.id });
    if (!cv) {
      throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    }

    return ok(
      toCompatCVDocumentDetail(presentCVDocument(cv)) satisfies GetCVDocumentResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    const rawBody = await req.json();
    const parsed = parseUpdateCVDocumentRequest(rawBody);
    if (!parsed.ok) {
      return errorResponse(parsed.error);
    }
    const body = parsed.value;

    if (
      body.public_enabled !== undefined ||
      body.public_feedback_enabled !== undefined ||
      body.public_slug !== undefined ||
      body.confirmPublicExposure !== undefined
    ) {
      const existingDocument = await cvLibraryModule
        .bindRequest(supabase)
        .getCVDocument.execute({ id, userId: user.id });
      const existing = existingDocument ? presentCVDocument(existingDocument) : null;
      if (!existing || existing.type !== "template") {
        throw notFound("Template CV not found", ErrorCode.TEMPLATE_CV_NOT_FOUND);
      }

      const nextEnabled = body.public_enabled ?? existing.public_enabled;
      if (
        body.public_enabled === true &&
        !existing.public_enabled &&
        body.confirmPublicExposure !== true
      ) {
        throw badRequest("Public CV confirmation is required.", ErrorCode.CV_PUBLIC_CONFIRMATION_REQUIRED);
      }

      const normalizedSlug = normalizePublicCVSlug(
        body.public_slug ?? existing.public_slug ?? existing.name
      );
      if (!normalizedSlug) {
        throw badRequest("Choose a valid public URL.", ErrorCode.CV_PUBLIC_INVALID_SLUG);
      }

      const updated = await cvLibraryModule
        .bindRequest(supabase)
        .updateCVDocumentPublicSettings.execute({
          id,
          userId: user.id,
          publicEnabled: nextEnabled,
          feedbackEnabled: body.public_feedback_enabled ?? existing.public_feedback_enabled,
          publicId: existing.public_id ?? generatePublicCVId(),
          publicSlug: normalizedSlug,
        });
      if (!updated) {
        throw notFound("Template CV not found", ErrorCode.TEMPLATE_CV_NOT_FOUND);
      }
      return ok(
        toCompatCVDocumentDetail(presentCVDocument(updated)) satisfies UpdateCVDocumentResponse
      );
    }

    if (body.profile || body.template_locale) {
      const updated = await cvLibraryModule
        .bindRequest(supabase)
        .updateTemplateCVDocumentProfile.execute({
          id,
          userId: user.id,
          ...(body.name?.trim() ? { name: body.name.trim() } : {}),
          ...(body.profile ? { profile: body.profile } : {}),
          ...(body.template_locale ? { templateLocale: body.template_locale } : {}),
        });
      if (!updated) {
        throw notFound("Template CV not found", ErrorCode.TEMPLATE_CV_NOT_FOUND);
      }
      return ok(
        toCompatCVDocumentDetail(presentCVDocument(updated)) satisfies UpdateCVDocumentResponse
      );
    }

    const trimmedName = body.name?.trim();
    if (!trimmedName) {
      throw badRequest("Name is required", ErrorCode.CV_NAME_REQUIRED);
    }

    const cv = await cvLibraryModule
      .bindRequest(supabase)
      .updateCVDocumentName.execute({ id, userId: user.id, name: trimmedName });
    if (!cv) {
      throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    }

    return ok(
      toCompatCVDocumentDetail(presentCVDocument(cv)) satisfies UpdateCVDocumentResponse
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthenticatedRequestContext();
    if (!authContext.ok) return authContext.response;
    const { supabase, user } = authContext;

    const { id } = await params;
    cvAnalysisModule.bindRequest(supabase);
    jobMatchAnalysisModule.bindRequest(supabase);
    const result = await cvLibraryModule
      .bindRequest(supabase)
      .deleteCVDocument.execute({ id, userId: user.id });
    if (result.status.isNotFound()) {
      throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    }
    if (result.status.isInUse()) {
      return NextResponse.json(
        {
          error: "Cannot delete a CV with associated analyses.",
          code: CV_DELETE_CONFLICT_CODE,
          details: { analyses: result.analyses },
        } satisfies CVDocumentDeleteConflictResponse,
        { status: 409 }
      );
    }

    return ok({ success: true } satisfies DeleteCVDocumentResponse);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
