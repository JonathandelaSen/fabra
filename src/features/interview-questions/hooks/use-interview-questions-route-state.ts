"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const basePath = "/interview-questions";
export type InterviewQuestionAnsweredFilter = "all" | "answered" | "empty";

export interface InterviewQuestionsFilters {
  search: string;
  cvId: string | null;
  analysisId: string | null;
  answered: InterviewQuestionAnsweredFilter;
}

function normalizeAnswered(value: string | null): InterviewQuestionAnsweredFilter {
  return value === "answered" || value === "empty" ? value : "all";
}

export function useInterviewQuestionsRouteState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const questionId = pathname.startsWith(`${basePath}/`)
    ? decodeURIComponent(pathname.slice(`${basePath}/`.length).split("/")[0] ?? "") ||
      null
    : null;

  const filters = useMemo<InterviewQuestionsFilters>(
    () => ({
      search: searchParams.get("q") ?? "",
      cvId: searchParams.get("cv"),
      analysisId: searchParams.get("offer"),
      answered: normalizeAnswered(searchParams.get("answered")),
    }),
    [searchParams]
  );

  const hrefFor = useCallback(
    (
      nextQuestionId: string | null,
      nextFilters: Partial<InterviewQuestionsFilters> = {}
    ) => {
      const merged = { ...filters, ...nextFilters };
      const query = new URLSearchParams();
      if (merged.search.trim()) query.set("q", merged.search.trim());
      if (merged.cvId) query.set("cv", merged.cvId);
      if (merged.analysisId) query.set("offer", merged.analysisId);
      if (merged.answered !== "all") query.set("answered", merged.answered);
      const qs = query.toString();
      const path = nextQuestionId
        ? `${basePath}/${encodeURIComponent(nextQuestionId)}`
        : basePath;
      return qs ? `${path}?${qs}` : path;
    },
    [filters]
  );

  const setFilters = useCallback(
    (nextFilters: Partial<InterviewQuestionsFilters>) => {
      router.push(hrefFor(questionId, nextFilters));
    },
    [hrefFor, questionId, router]
  );

  const selectQuestion = useCallback(
    (nextQuestionId: string) => {
      router.push(hrefFor(nextQuestionId));
    },
    [hrefFor, router]
  );

  const replaceQuestion = useCallback(
    (nextQuestionId: string) => {
      router.replace(hrefFor(nextQuestionId));
    },
    [hrefFor, router]
  );

  const clearQuestion = useCallback(() => {
    router.replace(hrefFor(null));
  }, [hrefFor, router]);

  return {
    pathname,
    questionId,
    filters,
    hrefFor,
    setFilters,
    selectQuestion,
    replaceQuestion,
    clearQuestion,
  };
}
