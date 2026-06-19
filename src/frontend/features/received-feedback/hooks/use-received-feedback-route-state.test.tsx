import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { useReceivedFeedbackRouteState } from "./use-received-feedback-route-state";

const navigation = vi.hoisted(() => ({
  pathname: "/received-feedback",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.replace,
  }),
}));

describe("useReceivedFeedbackRouteState", () => {
  beforeEach(() => {
    navigation.pathname = "/received-feedback";
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("parses and decodes a selected feedback id", () => {
    navigation.pathname = "/received-feedback/feedback%2Fone";

    const { result } = renderHookWithProviders(() =>
      useReceivedFeedbackRouteState(),
    );

    expect(result.current.selectedId).toBe("feedback/one");
  });

  it("uses push for user navigation and replace for automatic selection", () => {
    const { result } = renderHookWithProviders(() =>
      useReceivedFeedbackRouteState(),
    );

    act(() => {
      result.current.goToList();
      result.current.selectItem("feedback/one");
      result.current.replaceItem("feedback/two");
    });

    expect(navigation.push).toHaveBeenNthCalledWith(1, "/received-feedback");
    expect(navigation.push).toHaveBeenNthCalledWith(
      2,
      "/received-feedback/feedback%2Fone",
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/received-feedback/feedback%2Ftwo",
    );
  });
});
