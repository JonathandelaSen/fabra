"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOpportunityPerson,
  deleteOpportunityPerson,
  listOpportunityPeople,
  updateOpportunityPerson,
  type OpportunityPersonInput,
  type OpportunityPersonResponse,
} from "../api/opportunity-people-api";
import { jobMatchAnalysisQueryKeys } from "../api/job-match-analysis-query-keys";

export function useOpportunityPeople(analysisId: string) {
  const queryClient = useQueryClient();
  const queryKey = jobMatchAnalysisQueryKeys.people(analysisId);
  const query = useQuery({
    queryKey,
    queryFn: () => listOpportunityPeople(analysisId),
  });

  const createPerson = useMutation({
    mutationFn: (input: OpportunityPersonInput) =>
      createOpportunityPerson(analysisId, input),
    onSuccess: (created) => {
      queryClient.setQueryData<OpportunityPersonResponse[]>(
        queryKey,
        (current = []) => [...current, created],
      );
    },
  });

  const updatePerson = useMutation({
    mutationFn: ({
      personId,
      input,
    }: {
      personId: string;
      input: OpportunityPersonInput;
    }) => updateOpportunityPerson(analysisId, personId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<OpportunityPersonResponse[]>(
        queryKey,
        (current = []) =>
          current.map((person) =>
            person.id === updated.id ? updated : person,
          ),
      );
    },
  });

  const deletePerson = useMutation({
    mutationFn: (personId: string) =>
      deleteOpportunityPerson(analysisId, personId),
    onMutate: async (personId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousPeople =
        queryClient.getQueryData<OpportunityPersonResponse[]>(queryKey);
      queryClient.setQueryData<OpportunityPersonResponse[]>(
        queryKey,
        (current = []) =>
          current.filter((person) => person.id !== personId),
      );
      return { previousPeople };
    },
    onError: (_error, _personId, context) => {
      if (context?.previousPeople) {
        queryClient.setQueryData(queryKey, context.previousPeople);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    query,
    createPerson,
    updatePerson,
    deletePerson,
    isSaving: createPerson.isPending || updatePerson.isPending,
  };
}
