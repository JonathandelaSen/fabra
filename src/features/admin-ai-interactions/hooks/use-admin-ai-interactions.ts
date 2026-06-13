"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAdminAIInteractions, reviewAdminAIInteraction } from "../api/admin-ai-interactions-api";

const key = ["admin", "ai-interactions"] as const;

export function useAdminAIInteractions() {
  return useQuery({ queryKey: key, queryFn: listAdminAIInteractions });
}

export function useReviewAdminAIInteraction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reviewAdminAIInteraction,
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}
