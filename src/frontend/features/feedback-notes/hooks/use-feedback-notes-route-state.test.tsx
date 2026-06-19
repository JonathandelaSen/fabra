import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { useFeedbackNotesRouteState } from "./use-feedback-notes-route-state";

const navigation = vi.hoisted(() => ({
  pathname: "/feedback-notes",
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

describe("useFeedbackNotesRouteState", () => {
  beforeEach(() => {
    navigation.pathname = "/feedback-notes";
    navigation.searchParams = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("defaults unsupported statuses to active and decodes selection", () => {
    navigation.pathname = "/feedback-notes/feedback%2Fone";
    navigation.searchParams = new URLSearchParams("status=unsupported");

    const { result } = renderHookWithProviders(() =>
      useFeedbackNotesRouteState(),
    );

    expect(result.current.feedbackId).toBe("feedback/one");
    expect(result.current.status).toBe("active");
  });

  it("preserves status while navigating and changing selection", () => {
    navigation.pathname = "/feedback-notes/feedback-1";
    navigation.searchParams = new URLSearchParams("status=closed");
    const { result } = renderHookWithProviders(() =>
      useFeedbackNotesRouteState(),
    );

    act(() => {
      result.current.selectFeedback("feedback/2");
      result.current.replaceFeedback("feedback/3");
      result.current.clearSelection();
      result.current.setStatus("all");
    });

    expect(navigation.push).toHaveBeenNthCalledWith(
      1,
      "/feedback-notes/feedback%2F2?status=closed",
    );
    expect(navigation.replace).toHaveBeenNthCalledWith(
      1,
      "/feedback-notes/feedback%2F3?status=closed",
    );
    expect(navigation.replace).toHaveBeenNthCalledWith(
      2,
      "/feedback-notes?status=closed",
    );
    expect(navigation.push).toHaveBeenNthCalledWith(
      2,
      "/feedback-notes/feedback-1?status=all",
    );
  });
});
