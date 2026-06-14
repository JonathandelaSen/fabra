"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCVAnalysis,
  listCVAnalyses,
  listCVOptions,
} from "../api/cv-analysis-api";
import { cvAnalysisQueryKeys } from "../api/cv-analysis-query-keys";

export function useCVAnalysesList() {
  return useQuery({
    queryKey: cvAnalysisQueryKeys.list(),
    queryFn: listCVAnalyses,
  });
}

export function useCVAnalysisDetail(id: string | null) {
  return useQuery({
    queryKey: cvAnalysisQueryKeys.detail(id),
    queryFn: () => getCVAnalysis(id as string),
    enabled: Boolean(id),
  });
}

export function useCVAnalysisCVOptions() {
  return useQuery({
    queryKey: cvAnalysisQueryKeys.cvOptions(),
    queryFn: listCVOptions,
  });
}
