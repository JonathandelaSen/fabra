import type {
  CreateCVDocumentResponse,
  DeleteCVDocumentResponse,
  GetCVDocumentResponse,
  ListCVDocumentsResponse,
  UpdateCVDocumentResponse,
} from "@/app/api/cvs/responses";

export type CVDocumentListItem = ListCVDocumentsResponse[number];
export type CVDocumentDetail = GetCVDocumentResponse;

export interface RenameCVDocumentInput {
  id: string;
  name: string;
}

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function listCVDocuments() {
  const res = await fetch("/api/cvs");
  return readJsonResponse<ListCVDocumentsResponse>(
    res,
    "Could not load CV documents."
  );
}

export async function getCVDocument(id: string) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`);
  return readJsonResponse<GetCVDocumentResponse>(
    res,
    "Could not load CV document."
  );
}

export async function uploadCVDocument(formData: FormData) {
  const res = await fetch("/api/cvs", {
    method: "POST",
    body: formData,
  });
  return readJsonResponse<CreateCVDocumentResponse>(
    res,
    "Could not upload CV document."
  );
}

export async function renameCVDocument({ id, name }: RenameCVDocumentInput) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return readJsonResponse<UpdateCVDocumentResponse>(
    res,
    "Could not rename CV document."
  );
}

export async function deleteCVDocument(id: string) {
  const res = await fetch(`/api/cvs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return readJsonResponse<DeleteCVDocumentResponse>(
    res,
    "Could not delete CV document."
  );
}
