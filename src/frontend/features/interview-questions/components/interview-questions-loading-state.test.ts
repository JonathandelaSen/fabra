import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectInterviewQuestion,
  shouldShowInterviewQuestionsDetailLoader,
  shouldShowInterviewQuestionsShellLoader,
} from "./interview-questions-loading-state";

describe("interview questions loading state", () => {
  it("does not auto-select while the initial question list is still pending", () => {
    expect(
      shouldAutoSelectInterviewQuestion({
        isListPending: true,
        pathname: "/interview-questions",
        questionCount: 0,
        questionId: null,
      })
    ).toBe(false);
  });

  it("auto-selects from cached questions during a background refetch", () => {
    expect(
      shouldAutoSelectInterviewQuestion({
        isListPending: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(true);
  });

  it("keeps the sidebar visible and shows the detail skeleton before auto-selection", () => {
    expect(
      shouldShowInterviewQuestionsShellLoader({
        isDetailPending: false,
        isListPending: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(false);

    expect(
      shouldShowInterviewQuestionsDetailLoader({
        isDetailPending: false,
        isListPending: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(true);
  });

  it("regression: keeps the detail loader on right after auto-selecting a question, before its detail loads (no empty-state flash)", () => {
    expect(
      shouldShowInterviewQuestionsDetailLoader({
        isDetailPending: true,
        isListPending: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: "one",
      })
    ).toBe(true);
  });

  it("regression: keeps the detail loader on during the route handoff when the URL already moved to a question but the local selection still lags (questions exist, nothing selected)", () => {
    expect(
      shouldShowInterviewQuestionsDetailLoader({
        isDetailPending: false,
        isListPending: false,
        pathname: "/interview-questions/one",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(true);
  });

  it("only replaces the whole shell while the initial list has no questions yet", () => {
    expect(
      shouldShowInterviewQuestionsShellLoader({
        isDetailPending: false,
        isListPending: true,
        pathname: "/interview-questions",
        questionCount: 0,
        questionId: null,
      })
    ).toBe(true);

    expect(
      shouldShowInterviewQuestionsShellLoader({
        isDetailPending: false,
        isListPending: true,
        pathname: "/interview-questions/one",
        questionCount: 2,
        questionId: "one",
      })
    ).toBe(false);
  });
});
