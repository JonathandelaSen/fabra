"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CVAnalysisDetailResponse,
  ListCVAnalysesResponse,
} from "@/app/api/cv-analyses/responses";
import type { ListCVDocumentsResponse } from "@/app/api/cvs/responses";
import {
  createCVAnalysis,
  deleteCVAnalysis,
  scoreCVAnalysis,
  uploadCV,
  type CreateCVAnalysisInput,
  type ScoreCVAnalysisInput,
} from "../api/cv-analysis-api";
import { cvAnalysisQueryKeys } from "../api/cv-analysis-query-keys";

export function useCreateCVAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCVAnalysis,
    onSuccess: (analysis) => {
      queryClient.setQueryData(
        cvAnalysisQueryKeys.list(),
        (current: ListCVAnalysesResponse | undefined) => {
          const withoutDuplicate = (current ?? []).filter(
            (item) => item.id !== analysis.id,
          );
          return [analysis, ...withoutDuplicate];
        },
      );
      queryClient.setQueryData(cvAnalysisQueryKeys.detail(analysis.id), analysis);
    },
  });
}

export function useUploadCVForAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      uploadCV(file, name),
    onSuccess: (cv) => {
      queryClient.setQueryData(
        cvAnalysisQueryKeys.cvOptions(),
        (current: ListCVDocumentsResponse | undefined) => {
          const withoutDuplicate = (current ?? []).filter(
            (item) => item.id !== cv.id,
          );
          return [cv, ...withoutDuplicate];
        },
      );
    },
  });
}

export function useScoreCVAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ScoreCVAnalysisInput;
    }) => scoreCVAnalysis(id, input),
    onSuccess: (analysis) => {
      queryClient.setQueryData(cvAnalysisQueryKeys.detail(analysis.id), analysis);
      queryClient.setQueryData(
        cvAnalysisQueryKeys.list(),
        (current: ListCVAnalysesResponse | undefined) =>
          (current ?? []).map((item) =>
            item.id === analysis.id ? { ...item, ...analysis } : item,
          ),
      );
    },
  });
}

export function useDeleteCVAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCVAnalysis,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cvAnalysisQueryKeys.list() });
      const previousList = queryClient.getQueryData<ListCVAnalysesResponse>(
        cvAnalysisQueryKeys.list(),
      );
      const previousDetail = queryClient.getQueryData<CVAnalysisDetailResponse>(
        cvAnalysisQueryKeys.detail(id),
      );
      queryClient.setQueryData(
        cvAnalysisQueryKeys.list(),
        (current: ListCVAnalysesResponse | undefined) =>
          (current ?? []).filter((item) => item.id !== id),
      );
      queryClient.removeQueries({ queryKey: cvAnalysisQueryKeys.detail(id) });
      return { previousList, previousDetail, id };
    },
    onError: (_error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(cvAnalysisQueryKeys.list(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          cvAnalysisQueryKeys.detail(context.id),
          context.previousDetail,
        );
      }
    },
  });
}

export type { CreateCVAnalysisInput, ScoreCVAnalysisInput };
