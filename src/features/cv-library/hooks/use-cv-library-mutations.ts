"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type CVDocumentListItem,
  type RenameCVDocumentInput,
  deleteCVDocument,
  renameCVDocument,
  uploadCVDocument,
} from "../api/cv-library-api";
import { cvLibraryQueryKeys } from "../api/cv-library-query-keys";

interface OptimisticContext {
  previousList?: CVDocumentListItem[];
}

function replaceInList(
  list: CVDocumentListItem[] | undefined,
  item: CVDocumentListItem
) {
  return (list ?? []).map((current) => (current.id === item.id ? item : current));
}

export function useCVLibraryMutations() {
  const queryClient = useQueryClient();
  const listKey = cvLibraryQueryKeys.list();

  const startOptimisticUpdate = async () => {
    await queryClient.cancelQueries({ queryKey: listKey });
    return queryClient.getQueryData<CVDocumentListItem[]>(listKey);
  };

  const rollback = (context: OptimisticContext | undefined) => {
    if (context?.previousList) queryClient.setQueryData(listKey, context.previousList);
  };

  return {
    uploadCV: useMutation({
      mutationFn: uploadCVDocument,
      onSuccess: (cv) => {
        queryClient.setQueryData<CVDocumentListItem[]>(listKey, (current) => [
          cv,
          ...(current ?? []).filter((item) => item.id !== cv.id),
        ]);
        queryClient.setQueryData(cvLibraryQueryKeys.detail(cv.id), cv);
      },
    }),
    renameCV: useMutation({
      mutationFn: renameCVDocument,
      onMutate: async ({ id, name }: RenameCVDocumentInput) => {
        const previousList = await startOptimisticUpdate();
        queryClient.setQueryData<CVDocumentListItem[]>(listKey, (current) =>
          (current ?? []).map((item) =>
            item.id === id
              ? { ...item, name, updatedAt: new Date().toISOString() }
              : item
          )
        );
        queryClient.setQueryData(cvLibraryQueryKeys.detail(id), (current: unknown) =>
          current && typeof current === "object"
            ? { ...current, name, updatedAt: new Date().toISOString() }
            : current
        );
        return { previousList };
      },
      onError: (_error, _variables, context) => rollback(context),
      onSuccess: (cv) => {
        queryClient.setQueryData<CVDocumentListItem[]>(listKey, (current) =>
          replaceInList(current, cv)
        );
        queryClient.setQueryData(cvLibraryQueryKeys.detail(cv.id), cv);
      },
    }),
    deleteCV: useMutation({
      mutationFn: deleteCVDocument,
      onMutate: async (id: string) => {
        const previousList = await startOptimisticUpdate();
        queryClient.setQueryData<CVDocumentListItem[]>(listKey, (current) =>
          (current ?? []).filter((item) => item.id !== id)
        );
        queryClient.removeQueries({ queryKey: cvLibraryQueryKeys.detail(id) });
        return { previousList };
      },
      onError: (_error, _variables, context) => rollback(context),
    }),
  };
}
