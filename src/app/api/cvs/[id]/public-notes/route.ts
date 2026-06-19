import { NextRequest } from "next/server";
import { getAuthenticatedRequestContext } from "@/app/api/_shared/auth/request-context";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { cvLibraryModule } from "@/lib/container";
import { ok, errorResponse } from "@/backend/modules/shared";
import type { CVPublicNoteAnchorType } from "@/backend/modules/cv-library";
import type { ListPublicCVNotesResponse, ReplacePublicCVNotesResponse } from "./responses";
const present = (notes: Awaited<ReturnType<typeof cvLibraryModule.listCVPublicNotes.execute>>) => notes.map((note) => { const p = note.toPrimitives(); return { id: p.id, anchorType: p.anchorType, sectionId: p.sectionId, anchorId: p.anchorId, body: p.body }; });

function parse(body: unknown) {
  if (!body || typeof body !== "object" || !Array.isArray((body as { notes?: unknown }).notes)) return null;
  return (body as { notes: unknown[] }).notes.flatMap((note) => {
    if (!note || typeof note !== "object") return [];
    const value = note as Record<string, unknown>;
    const anchorType = value.anchorType as CVPublicNoteAnchorType;
    const text = typeof value.body === "string" ? value.body.trim() : "";
    if (!["presentation", "section", "item", "bullet"].includes(anchorType) || !text) return [];
    return [{ anchorType, sectionId: typeof value.sectionId === "string" ? value.sectionId : null, anchorId: typeof value.anchorId === "string" ? value.anchorId : null, body: text }];
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthenticatedRequestContext(); if (!auth.ok) return auth.response;
    const { id } = await params; cvLibraryModule.bindRequest(auth.supabase);
    return ok(present(await cvLibraryModule.listCVPublicNotes.execute({ cvId: id, userId: auth.user.id })) satisfies ListPublicCVNotesResponse);
  } catch (error) { return handleApiError(error); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthenticatedRequestContext(); if (!auth.ok) return auth.response;
    const notes = parse(await req.json());
    if (!notes) return errorResponse({ message: "Invalid notes", status: 400 });
    const { id } = await params; cvLibraryModule.bindRequest(auth.supabase);
    return ok(present(await cvLibraryModule.replaceCVPublicNotes.execute({ cvId: id, userId: auth.user.id, notes })) satisfies ReplacePublicCVNotesResponse);
  } catch (error) { return handleApiError(error); }
}
