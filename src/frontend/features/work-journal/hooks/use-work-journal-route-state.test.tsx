import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { useWorkJournalRouteState } from "./use-work-journal-route-state";

const navigation = vi.hoisted(() => ({
  pathname: "/work-journal",
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

describe("useWorkJournalRouteState", () => {
  beforeEach(() => {
    navigation.pathname = "/work-journal";
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("parses list and timeline selections", () => {
    navigation.pathname = "/work-journal/entry%2Fone";
    const list = renderHookWithProviders(() => useWorkJournalRouteState());
    expect(list.result.current).toMatchObject({
      view: "list",
      listEntryId: "entry/one",
      timelineEntryId: null,
    });
    list.unmount();

    navigation.pathname = "/work-journal/timeline/entry%2Ftwo";
    const timeline = renderHookWithProviders(() => useWorkJournalRouteState());
    expect(timeline.result.current).toMatchObject({
      view: "timeline",
      listEntryId: null,
      timelineEntryId: "entry/two",
    });
  });

  it("routes between list and timeline while encoding ids", () => {
    const { result } = renderHookWithProviders(() => useWorkJournalRouteState());

    act(() => {
      result.current.goToList();
      result.current.goToTimeline();
      result.current.selectListEntry("entry/one");
      result.current.replaceListEntry("entry/two");
      result.current.selectTimelineEntry("entry/three");
      result.current.backToTimeline();
    });

    expect(navigation.push).toHaveBeenNthCalledWith(1, "/work-journal");
    expect(navigation.push).toHaveBeenNthCalledWith(2, "/work-journal/timeline");
    expect(navigation.push).toHaveBeenNthCalledWith(
      3,
      "/work-journal/entry%2Fone",
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/work-journal/entry%2Ftwo",
    );
    expect(navigation.push).toHaveBeenNthCalledWith(
      4,
      "/work-journal/timeline/entry%2Fthree",
    );
    expect(navigation.push).toHaveBeenNthCalledWith(5, "/work-journal/timeline");
  });
});
