import { describe, expect, it } from "vitest";
import {
  shouldAutoSelectInterviewQuestion,
  shouldShowInterviewQuestionsDetailLoader,
  shouldShowInterviewQuestionsShellLoader,
} from "./interview-questions-loading-state";

describe("interview questions loading state", () => {
  it("does not auto-select while the question list query is in flight", () => {
    expect(
      shouldAutoSelectInterviewQuestion({
        isResolvingList: true,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(false);
  });

  it("keeps the sidebar visible while replacing the root URL with the first question id", () => {
    expect(
      shouldShowInterviewQuestionsShellLoader({
        isResolvingDetail: false,
        isResolvingList: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(false);

    expect(
      shouldShowInterviewQuestionsDetailLoader({
        isResolvingDetail: false,
        isResolvingList: false,
        pathname: "/interview-questions",
        questionCount: 2,
        questionId: null,
      })
    ).toBe(true);
  });

  it("only replaces the whole shell while the initial list has no questions yet", () => {
    expect(
      shouldShowInterviewQuestionsShellLoader({
        isResolvingDetail: false,
        isResolvingList: true,
        pathname: "/interview-questions",
        questionCount: 0,
        questionId: null,
      })
    ).toBe(true);

    expect(
      shouldShowInterviewQuestionsShellLoader({
        isResolvingDetail: false,
        isResolvingList: true,
        pathname: "/interview-questions/one",
        questionCount: 2,
        questionId: "one",
      })
    ).toBe(false);
  });
});
