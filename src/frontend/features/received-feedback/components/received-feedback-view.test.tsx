import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { server } from "@/testing/msw/server";
import { ReceivedFeedbackView } from "..";

const nav = vi.hoisted(() => {
  const store = { path: "/received-feedback", listeners: new Set<() => void>() };
  const setPath = (next: string) => {
    store.path = next;
    store.listeners.forEach((listener) => listener());
  };
  return {
    store,
    setPath,
    push: vi.fn((next: string) => setPath(next)),
    replace: vi.fn((next: string) => setPath(next)),
  };
});

vi.mock("next/navigation", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    usePathname: () =>
      React.useSyncExternalStore(
        (onChange: () => void) => {
          nav.store.listeners.add(onChange);
          return () => nav.store.listeners.delete(onChange);
        },
        () => nav.store.path.split("?")[0],
        () => nav.store.path.split("?")[0],
      ),
    useRouter: () => ({ push: nav.push, replace: nav.replace }),
    useSearchParams: () =>
      new URLSearchParams(nav.store.path.split("?")[1] ?? ""),
  };
});

const FEEDBACK_ID = "feedback-1";
const CONTEXT_ID = "context-1";

function feedbackItem() {
  return {
    id: FEEDBACK_ID,
    userId: "user-1",
    activityContextId: CONTEXT_ID,
    receivedDate: "2026-06-10",
    giverName: "Alex Manager",
    feedbackText: "Great ownership on the migration.",
    userNote: null,
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
  };
}

function activityContext() {
  return {
    id: CONTEXT_ID,
    userId: "user-1",
    name: "Platform Work",
    type: "project" as const,
    status: "active" as const,
    isDefault: true,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  };
}

describe("ReceivedFeedbackView manage contexts navigation", () => {
  beforeEach(() => {
    nav.store.path = "/received-feedback";
    nav.store.listeners.clear();
    nav.push.mockClear();
    nav.replace.mockClear();

    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("min-width: 1024px"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;

    server.use(
      http.get("http://localhost/api/received-feedback", () =>
        HttpResponse.json([feedbackItem()]),
      ),
      http.get("http://localhost/api/activity-contexts", () =>
        HttpResponse.json({ contexts: [activityContext()], suggestions: [] }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates to activity contexts without being clobbered back to the feedback route", async () => {
    const { user } = renderWithProviders(<ReceivedFeedbackView />);

    // Desktop auto-selects the first item, moving us onto the detail route.
    await waitFor(() => {
      expect(nav.store.path).toBe(`/received-feedback/${FEEDBACK_ID}`);
    });

    await user.click(await screen.findByRole("button", { name: /^Edit$/i }));

    const manageContexts = await screen.findByRole("button", {
      name: /Manage contexts/i,
    });

    // Ignore the legitimate auto-select replace that already happened.
    nav.replace.mockClear();
    await user.click(manageContexts);

    // The push to activity-contexts must stick: no effect should replace the
    // URL back to the feedback detail route once we've left the feature.
    await waitFor(() => {
      expect(nav.store.path.split("?")[0]).toBe("/activity-contexts");
    });

    expect(nav.push).toHaveBeenCalledWith(
      expect.stringContaining("/activity-contexts?source=received-feedback"),
    );
    expect(nav.replace).not.toHaveBeenCalledWith(
      `/received-feedback/${FEEDBACK_ID}`,
    );
  });
});
