"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  importJsonResume,
  type ImportJsonResumeInput,
  type CVDocumentListItem,
} from "../api/cv-library-api";
import { cvLibraryQueryKeys } from "../api/cv-library-query-keys";

export function useImportJsonResume() {
  const queryClient = useQueryClient();
  const listKey = cvLibraryQueryKeys.list();

  return useMutation({
    mutationFn: (input: ImportJsonResumeInput) => importJsonResume(input),
    onSuccess: (data) => {
      const previous =
        queryClient.getQueryData<CVDocumentListItem[]>(listKey) ?? [];
      queryClient.setQueryData(listKey, [
        data.document as unknown as CVDocumentListItem,
        ...previous,
      ]);
    },
  });
}
