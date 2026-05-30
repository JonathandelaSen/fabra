"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createActivityContext,
  deleteActivityContext,
  handleActivityContextSuggestion,
  listActivityContexts,
  updateActivityContext,
} from "../api/activity-context-api";
import type {
  ActivityContext,
  ActivityContextSuggestion,
  ActivityContextType,
  CreateActivityContextInput,
  UpdateActivityContextInput,
} from "../api/activity-context-api";
import { activityContextQueryKeys } from "../api/activity-context-query-keys";
import { getErrorMessage } from "@/lib/errors";

function invalidateActivityContextConsumers(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        key[0] === activityContextQueryKeys.all[0] ||
        (key[0] === "objectives" && key[1] === "workspace") ||
        key[0] === "work-journal" ||
        key[0] === "received-feedback"
      );
    },
  });
}

export function useActivityContexts() {
  return useQuery({
    queryKey: activityContextQueryKeys.lists(),
    queryFn: listActivityContexts,
  });
}

export function useCreateActivityContext() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createActivityContext,
    onSuccess: () => invalidateActivityContextConsumers(queryClient),
  });

  const create = useCallback(
    async (input: CreateActivityContextInput) => {
      setError(null);
      try {
        return await mutation.mutateAsync(input);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [mutation]
  );

  return { create, isPending: mutation.isPending, error, clearError: () => setError(null) };
}

export function useUpdateActivityContext() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateActivityContext,
    onSuccess: () => invalidateActivityContextConsumers(queryClient),
  });

  const update = useCallback(
    async (id: string, updates: UpdateActivityContextInput) => {
      setError(null);
      try {
        return await mutation.mutateAsync({ id, updates });
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [mutation]
  );

  return { update, isPending: mutation.isPending, error, clearError: () => setError(null) };
}

export function useDeleteActivityContext() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: deleteActivityContext,
    onSuccess: () => invalidateActivityContextConsumers(queryClient),
  });

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      try {
        return await mutation.mutateAsync(id);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [mutation]
  );

  return { remove, isPending: mutation.isPending, error, clearError: () => setError(null) };
}

export function useHandleActivityContextSuggestion() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: handleActivityContextSuggestion,
    onSuccess: () => invalidateActivityContextConsumers(queryClient),
  });

  const promote = useCallback(
    async (suggestion: ActivityContextSuggestion) => {
      setError(null);
      try {
        return await mutation.mutateAsync({ ...suggestion, action: "promote" });
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [mutation]
  );

  const hide = useCallback(
    async (suggestion: ActivityContextSuggestion) => {
      setError(null);
      try {
        await mutation.mutateAsync({ ...suggestion, action: "hide" });
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    },
    [mutation]
  );

  return { promote, hide, isPending: mutation.isPending, error, clearError: () => setError(null) };
}

export function useInvalidateActivityContextConsumers() {
  const queryClient = useQueryClient();
  return useCallback(
    () => invalidateActivityContextConsumers(queryClient),
    [queryClient]
  );
}

export type { ActivityContext, ActivityContextSuggestion, ActivityContextType };
