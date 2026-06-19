"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/errors";
import {
  cvLibraryQueryKeys,
  type CVDocumentListItem,
} from "@/frontend/features/cv-library";
import {
  createCVTemplateVersion,
  type CreateCVTemplateVersionResponse,
} from "../api/cv-templates-api";

interface UseCreateCVTemplateVersionOptions {
  onCreated?: (version: CVDocumentListItem) => void;
}

export function useCreateCVTemplateVersion({
  onCreated,
}: UseCreateCVTemplateVersionOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCVTemplateVersion,
    onSuccess: (data: CreateCVTemplateVersionResponse) => {
      queryClient.setQueryData<CVDocumentListItem[]>(
        cvLibraryQueryKeys.list(),
        (current) => [
          data.version,
          ...(current ?? []).filter((item) => item.id !== data.version.id),
        ]
      );
      queryClient.setQueryData(
        cvLibraryQueryKeys.detail(data.version.id),
        data.version
      );
      onCreated?.(data.version);
    },
  });

  return {
    create: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
