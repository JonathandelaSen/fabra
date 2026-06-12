"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCVPublicFeedback, listCVPublicFeedback } from "../api/public-cv-api";
import { publicCVKeys } from "../api/public-cv-query-keys";
export function usePublicCVFeedback(cvId: string | null) {
  const client = useQueryClient();
  const key = publicCVKeys.feedback(cvId ?? "none");
  const query = useQuery({ queryKey: key, queryFn: () => listCVPublicFeedback(cvId as string), enabled: Boolean(cvId) });
  const remove = useMutation({ mutationFn: deleteCVPublicFeedback, onMutate: async (id) => { await client.cancelQueries({ queryKey: key }); const previous = client.getQueryData(key); client.setQueryData(key, (items: Awaited<ReturnType<typeof listCVPublicFeedback>> = []) => items.filter((item) => item.id !== id)); return { previous }; }, onError: (_error, _id, context) => client.setQueryData(key, context?.previous), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return { query, remove };
}
