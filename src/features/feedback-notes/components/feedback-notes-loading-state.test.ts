import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectFeedbackNote,
  shouldShowFeedbackNotesContentLoader,
} from "./feedback-notes-loading-state";

describe("feedback notes loading state", () => {
  it("does not auto-select while the initial feedback list is still pending", () => {
    expect(
      shouldAutoSelectFeedbackNote({
        feedbackCount: 0,
        isListPending: true,
        pathname: "/feedback-notes",
        selectedFeedbackId: null,
      })
    ).toBe(false);
  });

  it("auto-selects from cached feedback during a background refetch", () => {
    expect(
      shouldAutoSelectFeedbackNote({
        feedbackCount: 2,
        isListPending: false,
        pathname: "/feedback-notes",
        selectedFeedbackId: null,
      })
    ).toBe(true);
  });

  it("shows the content loader before auto-selection (feedback exists, nothing selected)", () => {
    expect(
      shouldShowFeedbackNotesContentLoader({
        feedbackCount: 2,
        isDetailPending: false,
        isListPending: false,
        pathname: "/feedback-notes",
        selectedFeedbackId: null,
      })
    ).toBe(true);
  });

  it("shows the content loader while the selected feedback detail has no data yet", () => {
    expect(
      shouldShowFeedbackNotesContentLoader({
        feedbackCount: 2,
        isDetailPending: true,
        isListPending: false,
        pathname: "/feedback-notes",
        selectedFeedbackId: "a",
      })
    ).toBe(true);
  });

  it("does not show the content loader once the selected feedback is resolved", () => {
    expect(
      shouldShowFeedbackNotesContentLoader({
        feedbackCount: 2,
        isDetailPending: false,
        isListPending: false,
        pathname: "/feedback-notes",
        selectedFeedbackId: "a",
      })
    ).toBe(false);
  });

  it("regression: keeps the content loader on during the route handoff when the URL already moved to a feedback but the local selection still lags (feedback exists, nothing selected)", () => {
    expect(
      shouldShowFeedbackNotesContentLoader({
        feedbackCount: 2,
        isDetailPending: false,
        isListPending: false,
        pathname: "/feedback-notes/a",
        selectedFeedbackId: null,
      })
    ).toBe(true);
  });

  it("lets the empty state show only when there is genuinely no feedback", () => {
    expect(
      shouldShowFeedbackNotesContentLoader({
        feedbackCount: 0,
        isDetailPending: false,
        isListPending: false,
        pathname: "/feedback-notes",
        selectedFeedbackId: null,
      })
    ).toBe(false);
  });
});
