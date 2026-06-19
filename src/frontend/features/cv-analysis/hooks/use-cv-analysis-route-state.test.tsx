import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { useCVAnalysisRouteState } from "./use-cv-analysis-route-state";

const navigation = vi.hoisted(() => ({
  pathname: "/cv-analysis",
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

describe("useCVAnalysisRouteState", () => {
  beforeEach(() => {
    navigation.pathname = "/cv-analysis";
    navigation.searchParams = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("parses list, new, and detail route state", () => {
    const list = renderHookWithProviders(() => useCVAnalysisRouteState());
    expect(list.result.current).toMatchObject({
      mode: "list",
      analysisId: null,
      tab: null,
    });
    list.unmount();

    navigation.searchParams = new URLSearchParams("mode=new");
    const created = renderHookWithProviders(() => useCVAnalysisRouteState());
    expect(created.result.current.mode).toBe("new");
    created.unmount();

    navigation.pathname = "/cv-analysis/analysis%2Fone";
    navigation.searchParams = new URLSearchParams("tab=analysis");
    const detail = renderHookWithProviders(() => useCVAnalysisRouteState());
    expect(detail.result.current).toMatchObject({
      mode: "detail",
      analysisId: "analysis/one",
      tab: "analysis",
    });
  });

  it("normalizes unsupported tabs to null", () => {
    navigation.pathname = "/cv-analysis/analysis-1";
    navigation.searchParams = new URLSearchParams("tab=unsupported");

    const { result } = renderHookWithProviders(() => useCVAnalysisRouteState());

    expect(result.current.tab).toBeNull();
  });

  it("routes between list, creation, and detail modes", () => {
    const { result } = renderHookWithProviders(() => useCVAnalysisRouteState());

    act(() => {
      result.current.goToList();
      result.current.goToNew();
      result.current.goToDetail("analysis-1", "extraction");
      result.current.replaceDetail("analysis-2", "analysis");
    });

    expect(navigation.push).toHaveBeenNthCalledWith(1, "/cv-analysis");
    expect(navigation.push).toHaveBeenNthCalledWith(2, "/cv-analysis?mode=new");
    expect(navigation.push).toHaveBeenNthCalledWith(
      3,
      "/cv-analysis/analysis-1?tab=extraction",
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/cv-analysis/analysis-2?tab=analysis",
    );
  });

  it("changes tabs only from a selected detail route", () => {
    const list = renderHookWithProviders(() => useCVAnalysisRouteState());
    act(() => list.result.current.setTab("analysis"));
    expect(navigation.replace).not.toHaveBeenCalled();
    list.unmount();

    navigation.pathname = "/cv-analysis/analysis-1";
    const detail = renderHookWithProviders(() => useCVAnalysisRouteState());
    act(() => detail.result.current.setTab("extraction"));

    expect(navigation.replace).toHaveBeenCalledWith(
      "/cv-analysis/analysis-1?tab=extraction",
    );
  });
});
