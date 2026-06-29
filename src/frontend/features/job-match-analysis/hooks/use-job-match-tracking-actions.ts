"use client";

import { useTranslations } from "next-intl";
import { useConfirm } from "@/frontend/components/shared/confirm-provider";
import type {
  CreateFollowUpEntryInput,
  FollowUpEntryInput,
} from "../api/job-match-analysis-api";
import { useJobMatchAnalysisMutations } from "./use-job-match-analysis-mutations";

export function useJobMatchTrackingActions(analysisId: string | null) {
  const mutations = useJobMatchAnalysisMutations();
  const confirm = useConfirm();
  const t = useTranslations("analysisDetail.tracking");

  return {
    mutations,
    isSaving:
      mutations.createTrackingEntry.isPending ||
      mutations.updateTrackingEntry.isPending ||
      mutations.deleteTrackingEntry.isPending,
    createEntry: async (input: CreateFollowUpEntryInput) => {
      if (!analysisId) return;
      await mutations.createTrackingEntry.mutateAsync({ analysisId, input });
    },
    updateEntry: async (entryId: string, input: FollowUpEntryInput) => {
      if (!analysisId) return;
      await mutations.updateTrackingEntry.mutateAsync({
        analysisId,
        entryId,
        input,
      });
    },
    deleteEntry: async (entryId: string) => {
      if (!analysisId) return;
      if (!(await confirm({ title: t("deleteConfirm"), variant: "danger" }))) {
        return;
      }
      await mutations.deleteTrackingEntry.mutateAsync({ analysisId, entryId });
    },
  };
}
