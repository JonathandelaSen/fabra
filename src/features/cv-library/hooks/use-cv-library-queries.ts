"use client";

import { useQuery } from "@tanstack/react-query";
import { getCVDocument, listCVDocuments } from "../api/cv-library-api";
import { cvLibraryQueryKeys } from "../api/cv-library-query-keys";

export function useCVDocumentList() {
  return useQuery({
    queryKey: cvLibraryQueryKeys.list(),
    queryFn: listCVDocuments,
  });
}

export function useCVDocumentDetail(id: string | null) {
  return useQuery({
    queryKey: cvLibraryQueryKeys.detail(id),
    queryFn: () => getCVDocument(id as string),
    enabled: Boolean(id),
  });
}
