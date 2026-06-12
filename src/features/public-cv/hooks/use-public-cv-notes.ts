"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPublicCVNotes, replacePublicCVNotes, setPublicCVFeedbackEnabled } from "../api/public-cv-api";
import { publicCVKeys } from "../api/public-cv-query-keys";
export function usePublicCVNotes(cvId: string) {
  const client = useQueryClient(); const key = publicCVKeys.notes(cvId);
  const query = useQuery({ queryKey: key, queryFn: () => listPublicCVNotes(cvId) });
  const replace = useMutation({ mutationFn: (notes: Parameters<typeof replacePublicCVNotes>[1]) => replacePublicCVNotes(cvId, notes), onSuccess: (notes) => client.setQueryData(key, notes) });
  const setFeedbackEnabled = useMutation({ mutationFn: (enabled: boolean) => setPublicCVFeedbackEnabled(cvId, enabled) });
  return { query, replace, setFeedbackEnabled };
}
