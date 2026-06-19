import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { useInterviewQuestionsRouteState } from "./use-interview-questions-route-state";

const navigation = vi.hoisted(() => ({
  pathname: "/interview-questions",
  searchParams: new URLSearchParams(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.searchParams,
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.replace,
  }),
}));

describe("useInterviewQuestionsRouteState", () => {
  beforeEach(() => {
    navigation.pathname = "/interview-questions";
    navigation.searchParams = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("parses the selected question and normalized filters", () => {
    navigation.pathname = "/interview-questions/question%2Fone";
    navigation.searchParams = new URLSearchParams(
      "q=senior+engineer&cv=cv-1&offer=offer-1&answered=answered",
    );

    const { result } = renderHookWithProviders(() =>
      useInterviewQuestionsRouteState(),
    );

    expect(result.current.questionId).toBe("question/one");
    expect(result.current.filters).toEqual({
      search: "senior engineer",
      cvId: "cv-1",
      analysisId: "offer-1",
      answered: "answered",
    });
  });

  it("normalizes unsupported answered filters to all", () => {
    navigation.searchParams = new URLSearchParams("answered=unsupported");

    const { result } = renderHookWithProviders(() =>
      useInterviewQuestionsRouteState(),
    );

    expect(result.current.filters.answered).toBe("all");
    expect(result.current.hrefFor(null)).toBe("/interview-questions");
  });

  it("preserves filters, trims search, and encodes selected ids", () => {
    navigation.pathname = "/interview-questions/question-1";
    navigation.searchParams = new URLSearchParams("cv=cv-1&answered=empty");

    const { result } = renderHookWithProviders(() =>
      useInterviewQuestionsRouteState(),
    );

    act(() => {
      result.current.setFilters({ search: "  staff engineer  " });
      result.current.selectQuestion("question/2");
      result.current.replaceQuestion("question/3");
      result.current.clearQuestion();
    });

    expect(navigation.push).toHaveBeenNthCalledWith(
      1,
      "/interview-questions/question-1?q=staff+engineer&cv=cv-1&answered=empty",
    );
    expect(navigation.push).toHaveBeenNthCalledWith(
      2,
      "/interview-questions/question%2F2?cv=cv-1&answered=empty",
    );
    expect(navigation.replace).toHaveBeenNthCalledWith(
      1,
      "/interview-questions/question%2F3?cv=cv-1&answered=empty",
    );
    expect(navigation.replace).toHaveBeenNthCalledWith(
      2,
      "/interview-questions?cv=cv-1&answered=empty",
    );
  });
});
