import type { ListPublicCVNotesResponse, PublicCVNoteResponse, ReplacePublicCVNotesResponse } from "@/app/api/cvs/[id]/public-notes/responses";
import type { SubmitPublicCVFeedbackResponse } from "@/app/api/public/cv/[publicId]/feedback/responses";
import type { ListCVPublicFeedbackResponse } from "@/app/api/public-cv-feedback/responses";
import type { DeleteCVPublicFeedbackResponse } from "@/app/api/public-cv-feedback/[id]/responses";

async function json<T>(response: Response): Promise<T> { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Request failed"); return data; }
export const listPublicCVNotes = (cvId: string) => fetch(`/api/cvs/${cvId}/public-notes`).then((r) => json<ListPublicCVNotesResponse>(r));
export const replacePublicCVNotes = (cvId: string, notes: Array<Omit<PublicCVNoteResponse, "id">>) => fetch(`/api/cvs/${cvId}/public-notes`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }) }).then((r) => json<ReplacePublicCVNotesResponse>(r));
export const setPublicCVFeedbackEnabled = (cvId: string, enabled: boolean) => fetch(`/api/cvs/${cvId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ public_feedback_enabled: enabled }) }).then((r) => json<unknown>(r));
export const submitPublicCVFeedback = (publicId: string, input: Record<string, FormDataEntryValue>) => fetch(`/api/public/cv/${publicId}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }).then((r) => json<SubmitPublicCVFeedbackResponse>(r));
export const listCVPublicFeedback = (cvId: string) => fetch(`/api/public-cv-feedback?cvId=${encodeURIComponent(cvId)}`).then((r) => json<ListCVPublicFeedbackResponse>(r));
export const deleteCVPublicFeedback = (id: string) => fetch(`/api/public-cv-feedback/${id}`, { method: "DELETE" }).then((r) => json<DeleteCVPublicFeedbackResponse>(r));
